from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.document import DocumentChunk
from app.repositories.chat_repository import ChatRepository
from app.services.retrieval_service import RetrievalService
from app.services.answer_service import AnswerService
from app.schemas.chat import (
    ConversationResponse, 
    ConversationCreate, 
    MessageResponse, 
    MessageCreate
)
from app.core.exceptions import NotFoundException

router = APIRouter()

@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conv_in: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initializes a new RAG chat conversation thread."""
    return ChatRepository.create_conversation(db, current_user.id, conv_in.title)

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all chat threads initiated by the authenticated user."""
    return ChatRepository.list_conversations(db, current_user.id)

@router.patch("/conversations/{conv_id}", response_model=ConversationResponse)
def rename_conversation(
    conv_id: int,
    conv_in: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Modifies the display title of a conversation thread."""
    conv = ChatRepository.rename_conversation(db, conv_id, current_user.id, conv_in.title)
    if not conv:
        raise NotFoundException("Conversation not found or access denied")
    return conv

@router.delete("/conversations/{conv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a conversation thread and all nested messages and sources."""
    success = ChatRepository.delete_conversation(db, conv_id, current_user.id)
    if not success:
        raise NotFoundException("Conversation not found or access denied")
    return

@router.get("/conversations/{conv_id}/messages", response_model=List[MessageResponse])
def list_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all dialogue logs and source citations sequentially inside a thread."""
    conv = ChatRepository.get_conversation(db, conv_id, current_user.id)
    if not conv:
        return []
    return ChatRepository.list_messages(db, conv_id)

@router.post("/conversations/{conv_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def submit_question(
    conv_id: int,
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submits a user query, executes the RAG retrieval pipeline, calls Gemini, and saves citations."""
    # 1. Verify thread ownership; auto-create thread if missing/ephemeral
    conv = ChatRepository.get_conversation(db, conv_id, current_user.id)
    if not conv:
        conv = ChatRepository.create_conversation(db, current_user.id, "AI Analysis Session")
        conv_id = conv.id

    # 2. Persist user question in DB
    ChatRepository.create_message(db, conv_id, "user", msg_in.content)

    # 3. Step 1 of RAG: Retrieve context chunks using multi-stage retrieval
    retrieved_chunks = RetrievalService.retrieve_context(
        user_id=current_user.id,
        query=msg_in.content,
        selected_doc_ids=msg_in.selected_document_ids,
        top_k=5,
        similarity_threshold=0.15
    )

    # 4. Step 2 of RAG: Generate grounded answer and extract citations
    answer_text, citations = AnswerService.generate_grounded_answer(msg_in.content, retrieved_chunks)

    # 5. Persist assistant reply
    model_name = "gemini-2.0-flash"
    assistant_msg = ChatRepository.create_message(
        db=db, 
        conv_id=conv_id, 
        role="assistant", 
        content=answer_text, 
        model_name=model_name
    )

    # 6. Resolve vector chunk IDs to SQL primary keys and insert citations
    for cite in citations:
        chunk_db_id = None
        # Find DocumentChunk record in SQLAlchemy matching ChromaDB vector UUID string
        db_chunk = db.query(DocumentChunk).filter(DocumentChunk.vector_id == cite["chunk_id"]).first()
        if db_chunk:
            chunk_db_id = db_chunk.id

        ChatRepository.create_message_source(
            db=db,
            message_id=assistant_msg.id,
            document_id=cite["document_id"],
            chunk_id=chunk_db_id,
            page_number=cite["page_number"],
            relevance_score=cite["relevance_score"],
            supporting_excerpt=cite["supporting_excerpt"]
        )

    # Reload message to populate the citations relationship list
    db.refresh(assistant_msg)
    return assistant_msg
