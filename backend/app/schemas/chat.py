from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

class MessageSourceResponse(BaseModel):
    id: int
    message_id: int
    document_id: Optional[int] = None
    chunk_id: Optional[int] = None
    page_number: Optional[int] = None

    relevance_score: Optional[float] = None
    supporting_excerpt: str

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    model_name: Optional[str] = None
    created_at: datetime
    sources: List[MessageSourceResponse] = []

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, description="The user's query content")
    selected_document_ids: Optional[List[int]] = Field(
        None, 
        description="Filter context queries to specific documents. If null/empty, search all user documents."
    )

class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: str = Field("New Conversation", min_length=1, max_length=150)
