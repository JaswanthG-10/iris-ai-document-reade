from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Determine if we are using SQLite and apply appropriate connection flags
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False  # Set to True for verbose SQL logs during debugging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

_tables_created = False

def ensure_tables_exist():
    global _tables_created
    if not _tables_created:
        try:
            from app.models.base import Base
            Base.metadata.create_all(bind=engine)
            _tables_created = True
        except Exception:
            pass

def get_db() -> Generator:
    """Dependency injection helper for database sessions.
    
    Yields a database session and closes it when the request completes.
    """
    ensure_tables_exist()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
