from typing import Set
from fastapi import WebSocket

_clients: Set[WebSocket] = set()

def register(ws: WebSocket):
    _clients.add(ws)

def unregister(ws: WebSocket):
    _clients.discard(ws)

def get_clients():
    return list(_clients)
