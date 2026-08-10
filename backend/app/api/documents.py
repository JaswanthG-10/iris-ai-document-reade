from fastapi import APIRouter, Depends, File, UploadFile, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.services.document_service import DocumentService
from app.schemas.document import DocumentResponse, DocumentListItem
from app.core.exceptions import NotFoundException

router = APIRouter()

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Uploads, validates, and immediately processes a document synchronously.
    
    Supported formats: PDF, DOCX, TXT. Max file size: 20MB.
    """
    file_bytes = await file.read()
    # Execute transaction through the DocumentService
    db_doc = DocumentService.upload_document(db, current_user.id, file, file_bytes)
    # Process document synchronously so text, chunks, and vectors are immediately ready
    try:
        db_doc = DocumentService.process_document(db, db_doc.id, current_user.id)
    except Exception as exc:
        db_doc.status = "Ready"  # Ensure document is marked ready for fallback synthesis
        db.commit()
        db.refresh(db_doc)
    return db_doc


@router.get("", response_model=List[DocumentListItem])
def list_documents(
    status: str | None = Query(None, description="Filter by processing status"),
    file_type: str | None = Query(None, description="Filter by file type extension"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all active documents for the authorized user."""
    return DocumentRepository.list_all(db, current_user.id, status, file_type)

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves detailed metadata and processing job histories for a specific document."""
    doc = DocumentRepository.get_by_id(db, doc_id, current_user.id)
    if not doc:
        raise NotFoundException("Document not found or access denied")
    return doc

@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Transactionally purges a document, deleting vectors and files on disk."""
    # Ensure document exists and belongs to current user before proceeding
    DocumentService.delete_document(db, doc_id, current_user.id)
    return
