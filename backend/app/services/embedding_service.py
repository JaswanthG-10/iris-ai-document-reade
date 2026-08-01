import logging
from typing import List
from sentence_transformers import SentenceTransformer, CrossEncoder
from app.core.config import settings
from app.core.exceptions import ProcessingException

logger = logging.getLogger("documind")

class EmbeddingService:
    """Singleton service wrapping SentenceTransformers for local embedding generation."""
    
    _model = None

    @classmethod
    def get_model(cls) -> SentenceTransformer:
        """Lazy-loads and caches the SentenceTransformer embedding model."""
        if cls._model is None:
            try:
                logger.info(f"Loading local embedding model '{settings.EMBEDDING_MODEL_NAME}' into memory...")
                cls._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
                logger.info("Embedding model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {str(e)}", exc_info=True)
                raise ProcessingException(f"Embedding model initialization failed: {str(e)}")
        return cls._model

    @classmethod
    def embed_text(cls, text: str) -> List[float]:
        """Generates a high-dimensional vector embedding for a single text query."""
        model = cls.get_model()
        try:
            vector = model.encode(text, convert_to_numpy=True)
            return vector.tolist()
        except Exception as e:
            raise ProcessingException(f"Failed generating embedding: {str(e)}")

    @classmethod
    def embed_batch(cls, texts: List[str]) -> List[List[float]]:
        """Generates embeddings in batched operations for optimal CPU/GPU processing."""
        if not texts:
            return []
        model = cls.get_model()
        try:
            vectors = model.encode(texts, convert_to_numpy=True, batch_size=32, show_progress_bar=False)
            return vectors.tolist()
        except Exception as e:
            raise ProcessingException(f"Failed batch embedding generation: {str(e)}")


class RerankerService:
    """Singleton service wrapping CrossEncoder models for high-accuracy chunk reranking."""

    _model = None

    @classmethod
    def get_model(cls) -> CrossEncoder:
        """Lazy-loads and caches the CrossEncoder model when reranking is active."""
        if cls._model is None:
            try:
                logger.info(f"Loading local CrossEncoder reranker '{settings.RERANK_MODEL_NAME}'...")
                cls._model = CrossEncoder(settings.RERANK_MODEL_NAME)
                logger.info("CrossEncoder model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load reranker model: {str(e)}", exc_info=True)
                # Fail gracefully by logging but not crashing, so retrieval can fall back
                raise ProcessingException(f"Reranker initialization failed: {str(e)}")
        return cls._model

    @classmethod
    def rerank(cls, query: str, passages: List[str]) -> List[float]:
        """Computes semantic matching relevance scores for (query, passage) pairs."""
        if not passages:
            return []
        try:
            model = cls.get_model()
            pairs = [[query, passage] for passage in passages]
            scores = model.predict(pairs)
            # Normalize to list of floats
            return [float(score) for score in scores]
        except Exception as e:
            logger.error(f"Reranking computation failed, returning flat score fallbacks: {str(e)}")
            # Return flat 0.0 scores to prevent pipeline crashes
            return [0.0] * len(passages)
