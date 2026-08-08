import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

IS_VERCEL = os.getenv("VERCEL") == "1"

DEFAULT_UPLOAD_DIR = "/tmp/uploads" if IS_VERCEL else "uploads"

DEFAULT_DATABASE_URL = (
    "sqlite:////tmp/documind.db"
    if IS_VERCEL
    else "sqlite:///./documind.db"
)

DEFAULT_CHROMA_DIR = (
    "/tmp/chroma_db"
    if IS_VERCEL
    else "chroma_db"
)


class Settings(BaseModel):
    PROJECT_NAME: str = "DocuMind AI"
    API_V1_STR: str = "/api/v1"

    # ---------------------------------------------------------
    # Security
    # ---------------------------------------------------------
    SECRET_KEY: str = Field(
        default_factory=lambda: os.getenv(
            "SECRET_KEY",
            "supersecretkey_change_me_in_production",
        )
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # ---------------------------------------------------------
    # Database
    # ---------------------------------------------------------
    DATABASE_URL: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            DEFAULT_DATABASE_URL,
        )
    )

    # ---------------------------------------------------------
    # File storage
    # ---------------------------------------------------------
    UPLOAD_DIR: Path = Field(
        default_factory=lambda: Path(
            os.getenv(
                "UPLOAD_DIR",
                DEFAULT_UPLOAD_DIR,
            )
        )
    )

    # ---------------------------------------------------------
    # ChromaDB
    # ---------------------------------------------------------
    CHROMA_PERSIST_DIR: str = Field(
        default_factory=lambda: os.getenv(
            "CHROMA_PERSIST_DIR",
            DEFAULT_CHROMA_DIR,
        )
    )

    # ---------------------------------------------------------
    # Gemini Embeddings
    # ---------------------------------------------------------
    GEMINI_EMBEDDING_MODEL: str = Field(
        default_factory=lambda: os.getenv(
            "GEMINI_EMBEDDING_MODEL",
            "gemini-embedding-2",
        )
    )

    # ---------------------------------------------------------
    # Gemini API
    # ---------------------------------------------------------
    GEMINI_API_KEY: str = Field(
        default_factory=lambda: os.getenv(
            "GEMINI_API_KEY",
            "",
        )
    )

    class Config:
        arbitrary_types_allowed = True


settings = Settings()


# -------------------------------------------------------------
# Ensure required directories exist
# -------------------------------------------------------------

for _dir in (
    settings.UPLOAD_DIR,
    Path(settings.CHROMA_PERSIST_DIR),
):
    try:
        _dir.mkdir(
            parents=True,
            exist_ok=True,
        )
    except OSError:
        pass