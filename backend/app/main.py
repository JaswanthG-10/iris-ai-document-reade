from contextlib import asynccontextmanager

try:
    from fastapi import FastAPI, Request, status
    from fastapi.exceptions import RequestValidationError
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
except Exception:  # pragma: no cover - fallback for linters/IDE when fastapi is not installed
    # Lightweight fallbacks so static analyzers or environments without FastAPI don't error.
    from typing import Any

    class FastAPI:  # type: ignore
        def __init__(self, *args, **kwargs):
            pass

    Request = Any
    RequestValidationError = Exception
    CORSMiddleware = object

    class status:  # type: ignore
        HTTP_422_UNPROCESSABLE_ENTITY = 422
        HTTP_500_INTERNAL_SERVER_ERROR = 500

    class JSONResponse:  # type: ignore
        def __init__(self, *args, **kwargs):
            pass

from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import DocuMindException
from app.core.logging import logger, setup_logging
from app.models.base import Base


setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Iris AI Platform...")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as exc:
        logger.exception("Database initialization failed: %s", exc)

    yield

    logger.info("Stopping Iris AI Platform...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Document Understanding and Retrieval API Platform",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*\.vercel\.app|https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def sanitize_error_details(errors):
    sanitized = []
    for err in errors:
        err_copy = dict(err)
        if "input" in err_copy:
            val = err_copy["input"]
            if isinstance(val, bytes):
                err_copy["input"] = f"<bytes len={len(val)}>"
            elif not isinstance(val, (str, int, float, bool, list, dict, type(None))):
                err_copy["input"] = str(val)
        sanitized.append(err_copy)
    return sanitized


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    logger.warning(
        "Validation error on %s: %s",
        request.url.path,
        sanitize_error_details(exc.errors()),
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Invalid request payload or missing JSON parameters.",
            "details": sanitize_error_details(exc.errors()),
        },
    )


@app.exception_handler(DocuMindException)
async def documind_exception_handler(
    request: Request,
    exc: DocuMindException,
):
    logger.warning(
        "Application error on %s: %s",
        request.url.path,
        exc.message,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(
        "Unhandled error on %s: %s",
        request.url.path,
        exc,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error.", "detail": str(exc)},
    )


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Iris AI Platform API",
        "docs_url": "/docs",
        "health_url": "/api/v1/health",
    }


@app.get("/api/v1/health")
def basic_health():
    return {"status": "healthy"}


# Import routers after the app and basic routes are created.
# NOTE: intentionally NOT wrapped in try/except so that a broken router
# fails loudly with a full traceback instead of silently vanishing.
from app.api import auth, chat, documents, health

app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"],
)

app.include_router(
    health.router,
    prefix=f"{settings.API_V1_STR}/health",
    tags=["Observability"],
)

app.include_router(
    documents.router,
    prefix=f"{settings.API_V1_STR}/documents",
    tags=["Documents"],
)

app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_STR}/chat",
    tags=["Chat"],
)