from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import DocuMindException
from app.core.database import engine
from app.models.base import Base
# Import models to ensure they register on Base metadata
from app.api import auth, health, documents, chat


# 1. Initialize Logging Configuration
setup_logging()
logger.info("Initializing DocuMind AI Platform...")

# 2. Database migrations - Auto-create SQLite database tables on startup
try:
    logger.info("Syncing relational database models...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database synced successfully.")
except Exception as e:
    logger.error(f"Failed to initialize database: {str(e)}", exc_info=True)

# 3. Create FastAPI Application instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Document Understanding and Retrieval API Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi.exceptions import RequestValidationError

# 5. Global Exception Handlers mapping structured errors to client JSON
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Request validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Invalid request payload or missing JSON parameters."}
    )

@app.exception_handler(DocuMindException)
async def documind_exception_handler(request: Request, exc: DocuMindException):
    logger.warning(f"Application exception intercepted on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "An internal server error occurred. Please check system logs."}
    )

# 6. Register Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["Observability"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Documents"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["Chat"])


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Iris AI Platform API",
        "docs_url": "/docs",
        "health_url": "/api/v1/health"
    }
