from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

class ProcessingJobResponse(BaseModel):
    id: int
    document_id: int
    stage: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    user_id: int
    original_name: str
    display_name: str
    file_type: str
    mime_type: str
    size_bytes: int
    content_hash: str
    page_count: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    jobs: List[ProcessingJobResponse] = []

    class Config:
        from_attributes = True

class DocumentListItem(BaseModel):
    id: int
    display_name: str
    file_type: str
    size_bytes: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
