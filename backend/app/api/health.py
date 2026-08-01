import os
import psutil
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()

@router.get("", status_code=status.HTTP_200_OK)
def check_health(db: Session = Depends(get_db)):
    """Health check endpoint checking core services.
    
    Verifies Database connections, local disk availability, and returns system usage metrics.
    """
    health_status = {
        "status": "healthy",
        "database": "connected",
        "disk": "available",
        "system": {}
    }
    
    # 1. Test database connection
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database"] = f"disconnected: {str(e)}"
        
    # 2. Test local write access to upload directory
    try:
        test_file_path = settings.UPLOAD_DIR / ".health_check_temp"
        test_file_path.touch(exist_ok=True)
        test_file_path.unlink()
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["disk"] = f"read-only or unavailable: {str(e)}"
        
    # 3. Retrieve local system resources (useful for local ML run observability)
    try:
        health_status["system"] = {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage(str(settings.UPLOAD_DIR)).percent
        }
    except Exception:
        health_status["system"] = "Could not retrieve system stats"
        
    # 4. Report LLM model configurations
    health_status["config"] = {
        "embedding_model": settings.EMBEDDING_MODEL_NAME,
        "reranking_enabled": settings.RERANKING_ENABLED,
        "reranking_model": settings.RERANK_MODEL_NAME,
        "llm_provider": "Gemini" if settings.GEMINI_API_KEY else "Not Configured (Missing GEMINI_API_KEY)"
    }
    
    return health_status
