import logging
import os
import sys
from pathlib import Path

# Create logs directory if it doesn't exist
IS_VERCEL = os.getenv("VERCEL") == "1"
log_dir = Path("/tmp/logs") if IS_VERCEL else Path("logs")

try:
    log_dir.mkdir(parents=True, exist_ok=True)
except OSError:
    pass

def setup_logging():
    """Sets up root logger configuration."""
    handlers = [logging.StreamHandler(sys.stdout)]

    # Only add file logging if the log directory is actually writable
    try:
        handlers.append(logging.FileHandler(log_dir / "app.log", encoding="utf-8"))
    except OSError:
        pass

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        handlers=handlers,
    )
    
    # Set logger levels for noisy third party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)
    logging.getLogger("hnswlib").setLevel(logging.WARNING)

logger = logging.getLogger("documind")
