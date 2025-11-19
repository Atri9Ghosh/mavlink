
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from mavlink.connection import connect_mavlink
from mavlink.parser import parse_mavlink
from ws.manager import register, unregister
from ws.broadcaster import broadcast

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    register(ws)

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        unregister(ws)

@app.on_event("startup")
async def startup_event():
    try:
        mav = connect_mavlink()
        asyncio.create_task(parse_mavlink(mav, broadcast))
    except Exception as e:
        from utils.logger import log
        log(f"Failed to start MAVLink connection: {e}")
        log("Backend will continue running, but MAVLink data will not be available")


