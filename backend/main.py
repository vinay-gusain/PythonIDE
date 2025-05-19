from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import os
import sys
import io
import contextlib
from typing import Dict, Set
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PythonIDE Backend")

# Get allowed origins from environment variable or use default
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,https://pythonide.vercel.app,https://pythonide-frontend.vercel.app"
).split(",")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add logging for CORS and WebSocket connections
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Origin: {request.headers.get('origin')}")
    response = await call_next(request)
    return response

# Store active WebSocket connections
active_connections: Dict[str, Set[WebSocket]] = {}

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up PythonIDE backend...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down PythonIDE backend...")

async def send_json_message(websocket: WebSocket, message_type: str, content: str):
    """Send a structured JSON message through the WebSocket."""
    try:
        await websocket.send_json({
            "type": message_type,
            "content": content
        })
    except Exception as e:
        logger.error(f"Error sending message: {e}")

async def execute_python_code(code: str) -> tuple[str, str]:
    """Execute Python code and return (stdout, stderr)."""
    stdout = io.StringIO()
    stderr = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            # Create a new dictionary for the local namespace
            local_vars = {}
            # Execute the code
            exec(code, globals(), local_vars)
    except Exception as e:
        stderr.write(str(e))
    
    return stdout.getvalue(), stderr.getvalue()

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    logger.info(f"WebSocket connection attempt from origin: {websocket.headers.get('origin')}")
    await websocket.accept()
    logger.info(f"WebSocket connection accepted for session: {session_id}")
    
    if session_id not in active_connections:
        active_connections[session_id] = set()
    active_connections[session_id].add(websocket)

    try:
        await send_json_message(websocket, "output", "Execution environment ready")

        # Handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                
                try:
                    message = json.loads(data)
                    if message.get("type") != "execute":
                        await send_json_message(websocket, "error", "Invalid message type")
                        continue

                    code = message.get("code", "")
                    if not code:
                        await send_json_message(websocket, "error", "No code provided")
                        continue

                    # Execute the code
                    stdout, stderr = await execute_python_code(code)
                    
                    # Send stdout
                    if stdout:
                        await send_json_message(websocket, "output", stdout)
                    
                    # Send stderr
                    if stderr:
                        await send_json_message(websocket, "error", stderr)

                except json.JSONDecodeError:
                    await send_json_message(websocket, "error", "Invalid message format")
                except Exception as e:
                    logger.error(f"Error executing code: {e}")
                    await send_json_message(websocket, "error", f"Execution error: {str(e)}")

            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await send_json_message(websocket, "error", f"Connection error: {str(e)}")
                break

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Cleanup
        active_connections[session_id].remove(websocket)
        if not active_connections[session_id]:
            del active_connections[session_id]

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return JSONResponse(
        content={
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "active_sessions": len(active_connections)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 