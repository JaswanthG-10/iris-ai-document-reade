import logging
from typing import List

from google import genai
from google.genai import types

from app.core.config import settings
from app.core.exceptions import ProcessingException

logger = logging.getLogger("documind")


class EmbeddingService:
    """
    Generates document and query embeddings using Gemini.

    This replaces the previous SentenceTransformer implementation
    and avoids loading PyTorch and local ML models into the backend.
    """

    _client = None

    @classmethod
    def get_client(cls):
        """Create and cache the Gemini API client."""

        if cls._client is None:
            try:
                if not settings.GEMINI_API_KEY:
                    raise ValueError(
                        "GEMINI_API_KEY is not configured."
                    )

                cls._client = genai.Client(
                    api_key=settings.GEMINI_API_KEY
                )

                logger.info(
                    "Gemini embedding client initialized successfully."
                )

            except Exception as e:
                logger.error(
                    f"Failed to initialize Gemini client: {str(e)}",
                    exc_info=True,
                )

                raise ProcessingException(
                    f"Embedding client initialization failed: {str(e)}"
                )

        return cls._client

    @classmethod
    def embed_text(cls, text: str) -> List[float]:
        """
        Generate an embedding for a single text string.
        """

        if not text or not text.strip():
            return []

        try:
            client = cls.get_client()

            result = client.models.embed_content(
                model=settings.GEMINI_EMBEDDING_MODEL,
                contents=text,
                config=types.EmbedContentConfig(
                    output_dimensionality=768,
                ),
            )

            if not result.embeddings:
                raise ValueError(
                    "Gemini returned no embedding."
                )

            return list(result.embeddings[0].values)

        except Exception as e:
            logger.error(
                f"Failed generating embedding: {str(e)}",
                exc_info=True,
            )

            raise ProcessingException(
                f"Failed generating embedding: {str(e)}"
            )

    @classmethod
    def embed_batch(
        cls,
        texts: List[str],
    ) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        """

        if not texts:
            return []

        # Replace empty/whitespace strings with placeholder to ensure 1-to-1 length matching
        safe_texts = [
            text if (text and text.strip()) else "empty text passage"
            for text in texts
        ]

        try:
            client = cls.get_client()

            result = client.models.embed_content(
                model=settings.GEMINI_EMBEDDING_MODEL,
                contents=safe_texts,
                config=types.EmbedContentConfig(
                    output_dimensionality=768,
                ),
            )

            if not result.embeddings or len(result.embeddings) != len(texts):
                # Fallback to individual embeddings if batch count mismatches
                return [cls.embed_text(t) for t in safe_texts]

            return [
                list(embedding.values)
                for embedding in result.embeddings
            ]

        except Exception as e:
            logger.error(
                f"Failed generating batch embeddings: {str(e)}",
                exc_info=True,
            )

            raise ProcessingException(
                f"Failed batch embedding generation: {str(e)}"
            )


class RerankerService:
    """
    Lightweight compatibility service.

    The previous CrossEncoder implementation has been removed
    to eliminate the heavyweight Sentence Transformers/PyTorch
    dependency tree.

    Retrieval now relies on ChromaDB vector similarity.
    """

    @classmethod
    def rerank(
        cls,
        query: str,
        passages: List[str],
    ) -> List[float]:
        """
        Return neutral scores.

        This method remains available for compatibility with
        any code that may still import RerankerService.
        """

        if not passages:
            return []

        return [0.0] * len(passages)