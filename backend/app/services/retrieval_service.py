import math
import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.embedding_service import EmbeddingService, RerankerService
from app.services.vector_service import VectorService

logger = logging.getLogger("documind")

class RetrievalService:
    """Service handling multi-stage document retrieval (Bi-Encoder search + Cross-Encoder rerank)."""

    @classmethod
    def sigmoid(cls, x: float) -> float:
        """Converts raw reranker model logits into normalized similarity scores [0.0, 1.0]."""
        try:
            return 1.0 / (1.0 + math.exp(-x))
        except OverflowError:
            return 0.0 if x < 0 else 1.0

    @classmethod
    def retrieve_context(
        cls,
        user_id: int,
        query: str,
        selected_doc_ids: Optional[List[int]] = None,
        top_k: int = 5,
        similarity_threshold: float = 0.15
    ) -> List[Dict[str, Any]]:
        """Retrieves and ranks the most relevant document chunks matching a user query.
        
        Applies tenant isolation filters, vector search, score thresholds, and optional cross-encoder reranking.
        """
        # 1. Embed user query using local Bi-Encoder model
        logger.info(f"Retrieving context for query: '{query}' (Tenant: {user_id})")
        query_embedding = EmbeddingService.embed_text(query)

        # 2. Query persistent vector database (retrieve 2x top_k to feed the reranker stage)
        candidate_count = top_k * 2 if settings.RERANKING_ENABLED else top_k
        candidates = VectorService.query_chunks(
            user_id=user_id,
            query_embedding=query_embedding,
            selected_doc_ids=selected_doc_ids,
            top_k=candidate_count
        )

        if not candidates:
            logger.info("No text candidates returned from vector database.")
            return []

        # 3. Stage 2: Cross-Encoder Reranking (optional and modular)
        if settings.RERANKING_ENABLED and len(candidates) > 1:
            try:
                logger.info(f"Reranking {len(candidates)} candidates using CrossEncoder...")
                passages = [c["content"] for c in candidates]
                raw_scores = RerankerService.rerank(query, passages)

                # Update candidate scores with normalized sigmoid probabilities
                for idx, score in enumerate(raw_scores):
                    candidates[idx]["relevance_score"] = cls.sigmoid(score)

                # Sort by updated scores descending
                candidates.sort(key=lambda c: c["relevance_score"], reverse=True)
            except Exception as e:
                logger.warning(f"Reranking failed, falling back to original vector scores: {str(e)}")

        # 4. Filter by similarity threshold
        filtered_results = [
            c for c in candidates 
            if c["relevance_score"] >= similarity_threshold
        ]

        # Resilient Fallback: If strict threshold filtered out all candidates and threshold is reasonable (< 0.5), use top candidates
        if not filtered_results and candidates and similarity_threshold < 0.5:
            logger.info(f"Threshold >= {similarity_threshold} returned 0 items; falling back to top {top_k} candidates.")
            filtered_results = candidates[:top_k]

        logger.info(f"Retrieved {len(filtered_results)} chunks for query context.")

        # 5. Deduplicate identical text passages
        seen_contents = set()
        deduplicated = []
        for c in filtered_results:
            normalized_content = c["content"].strip().lower()
            if normalized_content not in seen_contents:
                seen_contents.add(normalized_content)
                deduplicated.append(c)

        # 6. Slice to final requested top_k limit
        return deduplicated[:top_k]
