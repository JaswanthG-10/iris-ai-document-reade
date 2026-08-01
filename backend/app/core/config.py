import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load environment variables from .env file
load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "DocuMind AI"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = Field(default_factory=lambda: os.getenv("SECRET_KEY", "supersecretkey_change_me_in_production"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days default for local testing
    
    # DB and File Storage
    DATABASE_URL: str = Field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./documind.db"))
    UPLOAD_DIR: Path = Field(default_factory=lambda: Path(os.getenv("UPLOAD_DIR", "uploads")))
    
    # ML and Vector Storage
    CHROMA_PERSIST_DIR: str = Field(default_factory=lambda: os.getenv("CHROMA_PERSIST_DIR", "chroma_db"))
    EMBEDDING_MODEL_NAME: str = Field(default_factory=lambda: os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2"))
    RERANKING_ENABLED: bool = Field(default_factory=lambda: os.getenv("RERANKING_ENABLED", "false").lower() == "true")
    RERANK_MODEL_NAME: str = Field(default_factory=lambda: os.getenv("RERANK_MODEL_NAME", "cross-encoder/ms-marco-MiniLM-L-6-v2"))
    
    # LLM config
    GEMINI_API_KEY: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))

    class Config:
        arbitrary_types_allowed = True

# Create instance of Settings
settings = Settings()

# Ensure critical directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
