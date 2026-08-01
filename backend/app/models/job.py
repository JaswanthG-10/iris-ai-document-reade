from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class ProcessingJob(Base):
    """Processing Job database model for tracking ingestion tasks progress."""
    __tablename__ = "processing_jobs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    stage = Column(String, nullable=False)  # Upload, Validation, Extraction, Chunking, Embedding
    status = Column(String, default="In Progress", nullable=False)  # In Progress, Completed, Failed
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    # Relationships
    document = relationship("Document", back_populates="jobs")

    def __repr__(self) -> str:
        return f"<ProcessingJob id={self.id} document_id={self.document_id} stage='{self.stage}' status='{self.status}'>"
