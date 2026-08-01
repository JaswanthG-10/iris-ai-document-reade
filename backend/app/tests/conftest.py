import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import get_db
from app.models.base import Base
from app.main import app
from app.core.config import settings

@pytest.fixture(autouse=True)
def configure_test_directories(tmp_path, monkeypatch):
    """Isolates uploads and vector storage directories for each test execution."""
    test_upload_dir = tmp_path / "uploads"
    test_chroma_dir = tmp_path / "chroma"
    
    # Override settings attributes using monkeypatch
    monkeypatch.setattr(settings, "UPLOAD_DIR", test_upload_dir)
    monkeypatch.setattr(settings, "CHROMA_PERSIST_DIR", str(test_chroma_dir))
    
    test_upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Reset VectorService singletons to force re-initialization with test directory
    from app.services.vector_service import VectorService
    VectorService._client = None
    VectorService._collection = None
    
    yield
    
    # Clear singletons again on teardown
    VectorService._client = None
    VectorService._collection = None



# Create an in-memory SQLite database engine for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(name="db_session", scope="function")
def fixture_db_session():
    """Create a fresh database schema and session for each unit test."""
    Base.metadata.create_all(bind=engine)
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(name="client", scope="function")
def fixture_client(db_session):
    """Override get_db dependency and return a TestClient instance."""
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_test_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
