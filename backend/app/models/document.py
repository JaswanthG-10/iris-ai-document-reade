from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class Document(Base):
    """Document database model representation."""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    original_name = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, txt
    mime_type = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    content_hash = Column(String, index=True, nullable=False)  # SHA-256 for duplicate checking
    storage_path = Column(String, nullable=False)
    page_count = Column(Integer, default=0, nullable=False)
    status = Column(String, default="Uploaded", nullable=False)  # Uploaded, Validating, Extracting, Chunking, Embedding, Ready, Failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    jobs = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Document id={self.id} display_name='{self.display_name}' status='{self.status}'>"


class DocumentChunk(Base):
    """Document Chunk database model representation for RAG text segments."""
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)  # Sequence index
    page_number = Column(Integer, nullable=True)   # Page mapping
    section_title = Column(String, nullable=True)  # Section/Header info
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=False)
    embedding_model = Column(String, nullable=False)
    vector_id = Column(String, index=True, nullable=False)  # Link to ChromaDB Vector UUID
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    document = relationship("Document", back_populates="chunks")

    def __repr__(self) -> str:
        return f"<DocumentChunk id={self.id} document_id={self.document_id} index={self.chunk_index}>"
