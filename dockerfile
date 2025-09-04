# Use lightweight Python base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps if needed (curl, gcc if pandas requires)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the app
COPY . .

# Run with gunicorn (production server), binding to Cloud Run port
CMD exec gunicorn --bind :8080 --workers 2 --threads 8 --timeout 0 "app:create_app()"
