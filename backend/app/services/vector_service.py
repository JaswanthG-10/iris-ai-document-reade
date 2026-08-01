import logging
from typing import List, Dict, Any, Optional
import chromadb
from app.core.config import settings
from app.core.exceptions import ProcessingException

logger = logging.getLogger("documind")

class VectorService:
    """Singleton service interfacing with ChromaDB persistent vector storage."""

    _client = None
    _collection = None
    COLLECTION_NAME = "documind_chunks"

    @classmethod
    def get_client(cls) -> chromadb.PersistentClient:
        """Lazy-loads the ChromaDB persistent client."""
        if cls._client is None:
            try:
                logger.info(f"Initializing ChromaDB client at folder '{settings.CHROMA_PERSIST_DIR}'...")
                cls._client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB: {str(e)}", exc_info=True)
                raise ProcessingException(f"Vector database initialization failed: {str(e)}")
        return cls._client

    @classmethod
    def get_collection(cls):
        """Retrieves or creates the chunks vector collection."""
        if cls._collection is None:
            client = cls.get_client()
            try:
                # We use default Cosine similarity metric (Chroma default is l2, 'cosine' is preferred for text models)
                cls._collection = client.get_or_create_collection(
                    name=cls.COLLECTION_NAME,
                    metadata={"hnsw:space": "cosine"}
                )
            except Exception as e:
                logger.error(f"Failed to retrieve vector collection: {str(e)}")
                raise ProcessingException(f"Vector collection retrieval failed: {str(e)}")
        return cls._collection

    @classmethod
    def upsert_chunks(
        cls, 
        user_id: int, 
        document_id: int, 
        chunks: List[Dict[str, Any]], 
        embeddings: List[List[float]]
    ):
        """Inserts text passages and matching vectors with user filters into ChromaDB."""
        collection = cls.get_collection()
        try:
            ids = [c["vector_id"] for c in chunks]
            documents = [c["content"] for c in chunks]
            metadatas = [{
                "user_id": user_id,
                "document_id": document_id,
                "page_number": c["page_number"] if c["page_number"] is not None else -1
            } for c in chunks]

            # Upsert into ChromaDB
            collection.upsert(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            logger.info(f"Successfully upserted {len(chunks)} vectors to ChromaDB for document {document_id}.")
        except Exception as e:
            logger.error(f"Failed inserting vectors to ChromaDB: {str(e)}", exc_info=True)
            raise ProcessingException(f"Vector database write failed: {str(e)}")

    @classmethod
    def query_chunks(
        cls, 
        user_id: int, 
        query_embedding: List[float], 
        selected_doc_ids: Optional[List[int]] = None, 
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """Queries vector index, strictly enforcing multi-tenant user filters.
        
        Returns:
            List of dictionaries containing document_id, page_number, content, and similarity score.
        """
        collection = cls.get_collection()
        try:
            # 1. Structure the security metadata filter
            if selected_doc_ids:
                if len(selected_doc_ids) == 1:
                    where_filter = {
                        "$and": [
                            {"user_id": user_id},
                            {"document_id": selected_doc_ids[0]}
                        ]
                    }
                else:
                    where_filter = {
                        "$and": [
                            {"user_id": user_id},
                            {"document_id": {"$in": selected_doc_ids}}
                        ]
                    }
            else:
                # Fallback to search all user documents
                where_filter = {"user_id": user_id}

            # 2. Query ChromaDB
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_filter
            )

            # 3. Format and parse results
            formatted_results = []
            if not results or not results["ids"] or not results["ids"][0]:
                return []

            ids = results["ids"][0]
            distances = results["distances"][0] if results["distances"] else [0.0] * len(ids)
            documents = results["documents"][0]
            metadatas = results["metadatas"][0]

            for idx in range(len(ids)):
                # Convert cosine distance to similarity score: similarity = 1 - distance
                distance = distances[idx]
                similarity_score = max(0.0, min(1.0, 1.0 - distance))

                formatted_results.append({
                    "vector_id": ids[idx],
                    "content": documents[idx],
                    "document_id": metadatas[idx]["document_id"],
                    "page_number": metadatas[idx]["page_number"] if metadatas[idx]["page_number"] != -1 else None,
                    "relevance_score": similarity_score
                })

            return formatted_results
        except Exception as e:
            logger.error(f"Failed querying vectors from ChromaDB: {str(e)}", exc_info=True)
            raise ProcessingException(f"Vector database query failed: {str(e)}")

    @classmethod
    def delete_document_vectors(cls, user_id: int, document_id: int):
        """Purges all vector index entries belonging to a document."""
        collection = cls.get_collection()
        try:
            # We strictly filter by user_id AND document_id to prevent tenant cross-deletions
            collection.delete(
                where={
                    "$and": [
                        {"user_id": user_id},
                        {"document_id": document_id}
                    ]
                }
            )
            logger.info(f"Purged vectors from ChromaDB for document {document_id}.")
        except Exception as e:
            logger.error(f"Failed deleting vectors from ChromaDB: {str(e)}")
            # Do not block deletion, we log and let DB cascade complete.
