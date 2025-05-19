# PythonIDE - Online Python Code Editor

A modern, web-based Python IDE that allows users to write, run, and debug Python code in their browser. Built with security and user experience in mind, especially for young coders learning to program.

## Features

- 🚀 Real-time code execution in secure Docker containers
- 💻 Integrated terminal-like interface for input/output
- 🎨 Syntax highlighting with Monaco Editor
- 📊 Support for both text and GUI output
- 🔒 Secure code execution environment
- 🎮 Interactive learning features
- 📱 Responsive design for all devices

## Tech Stack

- Frontend: React + TypeScript + Monaco Editor
- Backend: Python + FastAPI
- Container: Docker
- Real-time Communication: WebSocket

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- Docker
- Docker Compose

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. Start the development environment:
   ```bash
   docker-compose up
   ```

## Development

- Frontend runs on: http://localhost:3000
- Backend API runs on: http://localhost:8000
- WebSocket server runs on: ws://localhost:8000/ws

## Security

- Code execution is isolated in Docker containers
- Resource limits are enforced
- Network access is restricted
- Regular security updates

## License

MIT License 