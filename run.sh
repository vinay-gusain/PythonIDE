#!/bin/bash

# Build and start the application
echo "Building and starting PythonIDE..."

# Build the code execution image first
echo "Building code execution image..."
docker build -t pythonide-exec:latest -f backend/Dockerfile.exec backend/

# Start all services
echo "Starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

# Check if services are running
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "Backend is healthy!"
else
    echo "Backend is not healthy. Please check the logs:"
    docker-compose logs backend
    exit 1
fi

echo "PythonIDE is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo ""
echo "To stop the application, run: docker-compose down" 