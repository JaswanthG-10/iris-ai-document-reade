import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

# Detect Vercel
IS_VERCEL = os.getenv("VERCEL") == "1"


class Settings(BaseModel):
    PROJECT_NAME: str = "DocuMind AI"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = Field(
        default_factory=lambda: os.getenv(
            "SECRET_KEY",
            "supersecretkey_change_me_in_production"
        )
    )

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Database
    DATABASE_URL: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            "sqlite:////tmp/documind.db"
            if IS_VERCEL
            else "sqlite:///./documind.db"
        )
    )

    # Upload Directory
    UPLOAD_DIR: Path = Field(
        default_factory=lambda: Path(
            os.getenv(
                "UPLOAD_DIR",
                "/tmp/uploads"
                if IS_VERCEL
                else "uploads"
            )
        )
    )

    # ChromaDB
    CHROMA_PERSIST_DIR: str = Field(
        default_factory=lambda: os.getenv(
            "CHROMA_PERSIST_DIR",
            "/tmp/chroma_db"
            if IS_VERCEL
            else "chroma_db"
        )
    )

    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"

    RERANKING_ENABLED: bool = Field(
        default_factory=lambda: os.getenv(
            "RERANKING_ENABLED",
            "false"
        ).lower() == "true"
    )

    RERANK_MODEL_NAME: str = Field(
        default_factory=lambda: os.getenv(
            "RERANK_MODEL_NAME",
            "cross-encoder/ms-marco-MiniLM-L-6-v2"
        )
    )

    GEMINI_API_KEY: str = Field(
        default_factory=lambda: os.getenv(
            "GEMINI_API_KEY",
            ""
        )
    )

    class Config:
        arbitrary_types_allowed = True


settings = Settings()

# Create folders
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
Path(settings.CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)