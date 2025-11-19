# # backend/ws/broadcaster.py
# import asyncio
# import json
# from ws.manager import get_clients, unregister
# from mavlink.telemetry_state import TELEMETRY_STATE  # see next step

# # call this periodically via parse_mavlink when there is an update:
# async def broadcast():
#     clients = get_clients()
#     if not clients:
#         return

#     payload = None
#     try:
#         # prepare payload once per broadcast
#         payload = json.dumps(TELEMETRY_STATE)
#     except Exception:
#         payload = "{}"

#     # send to each client; remove dead ones
#     for ws in clients:
#         try:
#             # FastAPI/Starlette WebSocket has send_text/send_json
#             await ws.send_text(payload)
#         except Exception:
#             # if a client fails, unregister it so future broadcasts skip it
#             unregister(ws)




# backend/ws/broadcaster.py
import json
from mavlink.telemetry_state import get_state
from ws.manager import get_clients, unregister

async def broadcast():
    """Broadcast current telemetry state to all connected WebSocket clients"""
    clients = get_clients()
    if not clients:
        return

    # Get current state
    data = get_state()
    
    # Convert to JSON string
    try:
        payload = json.dumps(data)
    except Exception:
        payload = "{}"

   
    dead_clients = []
    for ws in clients:
        try:
            await ws.send_text(payload)
        except Exception:
            dead_clients.append(ws)

    
    for ws in dead_clients:
        unregister(ws)
