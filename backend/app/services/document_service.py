import hashlib
import os
import uuid
import logging
from pathlib import Path
from fastapi import UploadFile
import fitz  # PyMuPDF
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import ValidationException, DuplicateException, NotFoundException, ProcessingException
from app.repositories.document_repository import DocumentRepository
from app.models.document import Document, DocumentChunk
from app.services.extraction_service import ExtractionService
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorService


logger = logging.getLogger("documind")

class DocumentService:
    """Service orchestrating document upload validation, storage, background processing, and deletion."""

    # Configurable limits
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}
    SUPPORTED_MIME_TYPES = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    }

    @classmethod
    def validate_file_metadata(cls, filename: str, content_type: str, file_size: int):
        """Validates file extensions, size limits, and basic mime-types."""
        if file_size == 0:
            raise ValidationException("The uploaded file is empty")
        if file_size > cls.MAX_FILE_SIZE:
            raise ValidationException(f"File size exceeds the limit of {cls.MAX_FILE_SIZE // (1024 * 1024)}MB")

        ext = Path(filename).suffix.lower()
        if ext not in cls.SUPPORTED_EXTENSIONS:
            raise ValidationException(f"Unsupported file extension '{ext}'. Allowed: {', '.join(cls.SUPPORTED_EXTENSIONS)}")

        if content_type not in cls.SUPPORTED_MIME_TYPES and content_type != "application/octet-stream":
            raise ValidationException(f"Unsupported MIME type '{content_type}'")

    @classmethod
    def check_pdf_encrypted(cls, file_bytes: bytes, ext: str):
        """Attempts to open PDF files to check for corruption and password encryption."""
        if ext == ".pdf":
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                if doc.is_encrypted:
                    raise ValidationException("Password-protected PDFs are not supported")
                doc.close()
            except fitz.FileDataError:
                raise ValidationException("The uploaded PDF file appears to be corrupted")
            except Exception as e:
                if "password" in str(e).lower() or "encrypted" in str(e).lower():
                    raise ValidationException("Password-protected PDFs are not supported")
                raise ValidationException(f"Corrupted or invalid PDF format: {str(e)}")

    @classmethod
    def compute_sha256(cls, file_bytes: bytes) -> str:
        """Computes SHA-256 hash to identify duplicate uploads."""
        sha256_hash = hashlib.sha256()
        sha256_hash.update(file_bytes)
        return sha256_hash.hexdigest()

    @classmethod
    def upload_document(cls, db: Session, user_id: int, file: UploadFile, file_bytes: bytes) -> Document:
        """Processes, validates, saves, and creates database records for an uploaded document."""
        filename = file.filename or "unnamed_file"
        content_type = file.content_type or "application/octet-stream"
        file_size = len(file_bytes)
        ext = Path(filename).suffix.lower()

        cls.validate_file_metadata(filename, content_type, file_size)
        cls.check_pdf_encrypted(file_bytes, ext)

        content_hash = cls.compute_sha256(file_bytes)
        duplicate = DocumentRepository.get_by_hash(db, user_id, content_hash)
        if duplicate:
            raise DuplicateException(f"A duplicate document named '{duplicate.display_name}' has already been uploaded.")

        unique_disk_name = f"{uuid.uuid4()}{ext}"
        storage_path = settings.UPLOAD_DIR / unique_disk_name

        try:
            with open(storage_path, "wb") as f:
                f.write(file_bytes)
        except IOError as e:
            raise ValidationException(f"Failed to write file to local storage: {str(e)}")

        try:
            display_name = os.path.basename(filename)
            db_doc = DocumentRepository.create(
                db=db,
                user_id=user_id,
                original_name=filename,
                display_name=display_name,
                file_type=ext[1:],
                mime_type=content_type,
                size_bytes=file_size,
                content_hash=content_hash,
                storage_path=str(storage_path)
            )
            DocumentRepository.create_processing_job(db, db_doc.id, "Upload", "Completed")
            return db_doc
        except Exception as e:
            if storage_path.exists():
                storage_path.unlink()
            raise e

    @classmethod
    def process_document(cls, db: Session, doc_id: int, user_id: int):
        """Background pipeline running text extraction, character splitting, and DB insertion."""
        # 1. Retrieve document metadata
        doc = DocumentRepository.get_by_id(db, doc_id, user_id)
        if not doc:
            logger.error(f"Cannot run background pipeline on non-existent document ID: {doc_id}")
            return

        job_id = None
        try:
            # A. TEXT EXTRACTION STAGE
            logger.info(f"Starting extraction for document {doc.id} ({doc.display_name})...")
            job = DocumentRepository.create_processing_job(db, doc.id, "Extraction", "In Progress")
            job_id = job.id
            DocumentRepository.update_status(db, doc.id, "Extracting")

            pages = ExtractionService.extract_text(doc.storage_path, doc.file_type)
            page_count = len(pages)

            DocumentRepository.update_processing_job(db, job_id, "Completed")
            
            # B. TEXT CHUNKING STAGE
            logger.info(f"Starting chunking for document {doc.id} ({doc.display_name}) with {page_count} pages...")
            job = DocumentRepository.create_processing_job(db, doc.id, "Chunking", "In Progress")
            job_id = job.id
            DocumentRepository.update_status(db, doc.id, "Chunking")

            chunks_records = ChunkingService.chunk_document(pages, doc.id, user_id)
            DocumentRepository.update_processing_job(db, job_id, "Completed")
            
            # C. EMBEDDING GENERATION & VECTOR DB STAGE
            logger.info(f"Starting embeddings for document {doc.id} ({doc.display_name}) with {len(chunks_records)} chunks...")
            job = DocumentRepository.create_processing_job(db, doc.id, "Embedding", "In Progress")
            job_id = job.id
            DocumentRepository.update_status(db, doc.id, "Embedding")

            # Batch encode texts
            chunk_texts = [c["content"] for c in chunks_records]
            embeddings = EmbeddingService.embed_batch(chunk_texts)

            # Upsert vectors to ChromaDB
            VectorService.upsert_chunks(
                user_id=user_id,
                document_id=doc.id,
                chunks=chunks_records,
                embeddings=embeddings
            )

            # Insert chunks inside relational SQL DB transaction
            for record in chunks_records:
                db_chunk = DocumentChunk(
                    document_id=record["document_id"],
                    user_id=record["user_id"],
                    chunk_index=record["chunk_index"],
                    page_number=record["page_number"],
                    section_title=record["section_title"],
                    content=record["content"],
                    token_count=record["token_count"],
                    embedding_model=record["embedding_model"],
                    vector_id=record["vector_id"]
                )
                db.add(db_chunk)

            DocumentRepository.update_processing_job(db, job_id, "Completed")

            
            # Finalize pipeline
            DocumentRepository.update_status(db, doc.id, "Ready", page_count=page_count)
            logger.info(f"Pipeline completed successfully for document {doc.id}.")

        except Exception as e:
            logger.error(f"Background parsing pipeline failed for document {doc_id}: {str(e)}", exc_info=True)
            DocumentRepository.update_status(db, doc_id, "Failed", error_message=str(e))
            if job_id:
                DocumentRepository.update_processing_job(db, job_id, "Failed", error_message=str(e))

    @classmethod
    def delete_document(cls, db: Session, doc_id: int, user_id: int) -> bool:
        """Purges a document's file from local storage and deletes all DB mappings."""
        doc = DocumentRepository.get_by_id(db, doc_id, user_id)
        if not doc:
            raise NotFoundException("Document not found or access denied")

        # Purge vector embeddings from ChromaDB
        VectorService.delete_document_vectors(user_id, doc_id)

        file_path = Path(doc.storage_path)
        try:
            if file_path.exists():
                file_path.unlink()
        except OSError as e:
            logger.error(f"Failed deleting local disk file: {str(e)}")

        return DocumentRepository.delete(db, doc_id)

