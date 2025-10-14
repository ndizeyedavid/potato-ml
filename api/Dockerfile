# Use Python 3.9 slim image for smaller size and better compatibility
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    DEBIAN_FRONTEND=noninteractive \
    MONGODB_URI=mongodb://potatoml_milenodded:ad021f2d26979368a8c42bd5102032da7d171866@ym0c1x.h.filess.io:61034/potatoml_milenodded \
    MONGODB_DATABASE=potato_disease_db

# Install system dependencies required for TensorFlow and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements file first for better caching
COPY api/requirements.txt .

# Install Python dependencies with optimizations
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Create necessary directory structure
RUN mkdir -p /app/models

# Copy the API code
COPY api/main.py .
COPY api/main-tf-serving.py .

# Copy the model file
# Docker build context is repository root, so we can access models/ directly
COPY models/potatoes_v1.h5 /app/models/potatoes_v1.h5

# Create a non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port
EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/ping')" || exit 1

# Run the application with uvicorn
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1