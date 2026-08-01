from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

class UserRepository:
    """Repository handling CRUD operations for User records in SQL DB."""
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        """Retrieves a user record matching an email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        """Retrieves a user record matching a user ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        """Creates a new User record with password hashed."""
        db_user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=hash_password(user_in.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
