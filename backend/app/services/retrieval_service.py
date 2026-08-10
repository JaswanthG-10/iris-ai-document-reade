import logging
from typing import List, Dict, Any, Optional

from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorService

logger = logging.getLogger("documind")


class RetrievalService:
    """
    Lightweight document retrieval service.

    Uses:
    1. Gemini embeddings for query embedding
    2. ChromaDB/vector similarity for retrieval
    3. No local CrossEncoder reranking

    This keeps the backend lightweight enough for serverless deployment.
    """

    @classmethod
    def retrieve_context(
        cls,
        user_id: int,
        query: str,
        selected_doc_ids: Optional[List[int]] = None,
        top_k: int = 5,
        similarity_threshold: float = 0.15
    ) -> List[Dict[str, Any]]:
        """
        Retrieve the most relevant document chunks for a query.

        The ranking is based entirely on vector similarity.
        """

        logger.info(
            f"Retrieving context for query: '{query}' "
            f"(Tenant: {user_id})"
        )

        # ---------------------------------------------------------
        # 1. Generate query embedding
        # ---------------------------------------------------------
        try:
            query_embedding = EmbeddingService.embed_text(query)
        except Exception as e:
            logger.error(
                f"Query embedding failed: {str(e)}",
                exc_info=True
            )
            raise

        if not query_embedding:
            logger.warning("Empty query embedding returned.")
            return []

        # ---------------------------------------------------------
        # 2. Vector search
        # ---------------------------------------------------------
        try:
            candidates = VectorService.query_chunks(
                user_id=user_id,
                query_embedding=query_embedding,
                selected_doc_ids=selected_doc_ids,
                top_k=top_k
            )
        except Exception as e:
            logger.error(
                f"Vector search failed: {str(e)}",
                exc_info=True
            )
            raise

        if not candidates:
            logger.info("No candidates returned from ChromaDB; checking SQL DocumentChunk fallback.")
            try:
                from app.core.database import SessionLocal
                from app.models.document import DocumentChunk
                db = SessionLocal()
                try:
                    query_filter = [DocumentChunk.user_id == user_id]
                    if selected_doc_ids:
                        query_filter.append(DocumentChunk.document_id.in_(selected_doc_ids))
                    sql_chunks = db.query(DocumentChunk).filter(*query_filter).order_by(DocumentChunk.id.asc()).limit(top_k).all()
                    candidates = [
                        {
                            "vector_id": chunk.vector_id or f"chunk_{chunk.id}",
                            "content": chunk.content,
                            "document_id": chunk.document_id,
                            "page_number": chunk.page_number,
                            "relevance_score": 0.90
                        }
                        for chunk in sql_chunks
                    ]
                finally:
                    db.close()
            except Exception as sql_err:
                logger.error(f"SQL fallback chunk lookup failed: {sql_err}")

        if not candidates:
            return []

        # ---------------------------------------------------------
        # 3. Ensure candidates have a relevance score
        # ---------------------------------------------------------
        for candidate in candidates:
            if "relevance_score" not in candidate:
                # Try common score field names used by vector stores.
                if "similarity" in candidate:
                    candidate["relevance_score"] = float(
                        candidate["similarity"]
                    )
                elif "score" in candidate:
                    candidate["relevance_score"] = float(
                        candidate["score"]
                    )
                elif "distance" in candidate:
                    # Lower distance = better match.
                    candidate["relevance_score"] = 1.0 / (
                        1.0 + float(candidate["distance"])
                    )
                else:
                    # If VectorService doesn't provide a score,
                    # retain the candidate rather than crashing.
                    candidate["relevance_score"] = 1.0

        # ---------------------------------------------------------
        # 4. Sort using vector similarity
        # ---------------------------------------------------------
        candidates.sort(
            key=lambda c: c.get("relevance_score", 0.0),
            reverse=True
        )

        # ---------------------------------------------------------
        # 5. Apply similarity threshold
        # ---------------------------------------------------------
        filtered_results = [
            candidate
            for candidate in candidates
            if candidate.get("relevance_score", 0.0)
            >= similarity_threshold
        ]

        # ---------------------------------------------------------
        # 6. Resilient fallback (only for normal/default thresholds)
        if not filtered_results and candidates and similarity_threshold < 0.85:
            logger.info(
                f"No candidates passed similarity threshold "
                f"{similarity_threshold}. "
                f"Using top {top_k} candidates as fallback."
            )

            filtered_results = candidates[:top_k]

        # ---------------------------------------------------------
        # 7. Remove duplicate content
        # ---------------------------------------------------------
        seen_contents = set()
        deduplicated = []

        for candidate in filtered_results:
            content = candidate.get("content", "")

            normalized_content = content.strip().lower()

            if not normalized_content:
                continue

            if normalized_content not in seen_contents:
                seen_contents.add(normalized_content)
                deduplicated.append(candidate)

        # ---------------------------------------------------------
        # 8. Return final results
        # ---------------------------------------------------------
        results = deduplicated[:top_k]

        logger.info(
            f"Retrieved {len(results)} chunks for query context."
        )

        return results
