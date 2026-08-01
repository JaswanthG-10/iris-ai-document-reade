from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.job import ProcessingJob

class DocumentRepository:
    """Repository handling CRUD operations for Document metadata and ProcessingJob records."""

    @staticmethod
    def get_by_id(db: Session, doc_id: int, user_id: int) -> Document | None:
        """Retrieves a document by ID, restricted to the owning user."""
        return db.query(Document).filter(Document.id == doc_id, Document.user_id == user_id).first()

    @staticmethod
    def get_by_hash(db: Session, user_id: int, content_hash: str) -> Document | None:
        """Retrieves a document by its SHA-256 content hash for a specific user."""
        return db.query(Document).filter(
            Document.user_id == user_id, 
            Document.content_hash == content_hash
        ).first()

    @staticmethod
    def list_all(
        db: Session, 
        user_id: int, 
        status: str | None = None, 
        file_type: str | None = None
    ) -> list[Document]:
        """Lists all documents for a user, optionally filtering by status and type."""
        query = db.query(Document).filter(Document.user_id == user_id)
        if status:
            query = query.filter(Document.status == status)
        if file_type:
            query = query.filter(Document.file_type == file_type.lower())
        return query.order_by(Document.created_at.desc()).all()

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        original_name: str,
        display_name: str,
        file_type: str,
        mime_type: str,
        size_bytes: int,
        content_hash: str,
        storage_path: str
    ) -> Document:
        """Creates a new Document metadata record in the database."""
        db_doc = Document(
            user_id=user_id,
            original_name=original_name,
            display_name=display_name,
            file_type=file_type.lower(),
            mime_type=mime_type,
            size_bytes=size_bytes,
            content_hash=content_hash,
            storage_path=storage_path,
            status="Uploaded"
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        return db_doc

    @staticmethod
    def update_status(
        db: Session, 
        doc_id: int, 
        status: str, 
        error_message: str | None = None,
        page_count: int | None = None
    ) -> Document | None:
        """Updates the status and error messages of a Document."""
        db_doc = db.query(Document).filter(Document.id == doc_id).first()
        if db_doc:
            db_doc.status = status
            db_doc.error_message = error_message
            if page_count is not None:
                db_doc.page_count = page_count
            db_doc.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(db_doc)
        return db_doc

    @staticmethod
    def delete(db: Session, doc_id: int) -> bool:
        """Deletes a document from the database. Cascade constraints clean up jobs & chunks."""
        db_doc = db.query(Document).filter(Document.id == doc_id).first()
        if db_doc:
            db.delete(db_doc)
            db.commit()
            return True
        return False

    @staticmethod
    def create_processing_job(
        db: Session, 
        doc_id: int, 
        stage: str, 
        status: str = "In Progress"
    ) -> ProcessingJob:
        """Logs the start of a document processing pipeline stage."""
        db_job = ProcessingJob(
            document_id=doc_id,
            stage=stage,
            status=status,
            started_at=datetime.now(timezone.utc)
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job

    @staticmethod
    def update_processing_job(
        db: Session, 
        job_id: int, 
        status: str, 
        error_message: str | None = None
    ) -> ProcessingJob | None:
        """Updates the status and logs completions/errors of a processing stage."""
        db_job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        if db_job:
            db_job.status = status
            db_job.error_message = error_message
            if status in ["Completed", "Failed"]:
                db_job.completed_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(db_job)
        return db_job
