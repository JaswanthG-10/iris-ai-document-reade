from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, status, Request  # type: ignore[import]
from fastapi.security import OAuth2PasswordBearer  # type: ignore[import]
from sqlalchemy.orm import Session  # type: ignore[import]
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, verify_access_token
from app.core.exceptions import AuthenticationException, DuplicateException
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse, Token

router = APIRouter()

# Defines standard OAuth2 scheme extracting credentials token from Authorization Bearer header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """Dependency helper to extract and validate the JWT session user.
    
    Raises HTTP 401 if credentials are invalid or user record no longer exists.
    """
    email = verify_access_token(token)
    user = UserRepository.get_by_email(db, email)
    if user is None:
        raise AuthenticationException("Active session user not found")
    return user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user inside SQL database.
    
    Raises 409 Conflict if email is already taken.
    """
    existing_user = UserRepository.get_by_email(db, user_in.email)
    if existing_user:
        raise DuplicateException(f"Account with email '{user_in.email}' already exists")
    return UserRepository.create(db, user_in)

@router.post("/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    """Authenticates credentials (via JSON or Form data) and returns standard JWT Token session."""
    username: Optional[str] = None
    password: Optional[str] = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username") or body.get("email")
            password = body.get("password")
        except Exception:
            pass
    
    if not username or not password:
        try:
            form = await request.form()
            username = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not username or not password:
        raise AuthenticationException("Incorrect email or password")

    user = UserRepository.get_by_email(db, username)
    if not user or not verify_password(password, user.password_hash):
        raise AuthenticationException("Incorrect email or password")
    
    access_token = create_access_token(subject=user.email)
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieves current user details based on active JWT token."""
    return current_user
