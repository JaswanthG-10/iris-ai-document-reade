# Use slim Python runtime as base
FROM python:3.11-slim

# Prevent writing bytecode files (.pyc) and buffer logging streams
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies including Tesseract OCR and OpenGL libraries for PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Establish backend runtime directory
WORKDIR /app

# Copy python dependencies list and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase to container working directory
COPY . .

# Create persistent storage directories for SQLite DB and file uploads
RUN mkdir -p data uploads chroma_db

# Expose backend REST API port
EXPOSE 8000

# Execute server command launching FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
