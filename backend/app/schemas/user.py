from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="The user's display name")
    email: EmailStr = Field(..., description="The user's unique email address")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, description="The user's plaintext password")

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str | None = None
