import asyncio
from mavlink.telemetry_state import update_state
from utils.logger import log

async def parse_mavlink(mav, on_update_callback):
    """Parse MAVLink messages and update telemetry state"""
    log("MAVLink parser started")
    
    while True:
        try:
            
            msg = mav.recv_match(blocking=False, timeout=0.1)
            
            if msg is None:
                await asyncio.sleep(0.1)
                continue

            mtype = msg.get_type()
            data = msg.to_dict()

            
            if mtype == "GLOBAL_POSITION_INT":
                lat = data.get("lat")
                lon = data.get("lon")
                alt = data.get("alt")
                if lat is not None:
                    update_state("lat", lat / 1e7)
                if lon is not None:
                    update_state("lon", lon / 1e7)
                if alt is not None:
                    update_state("alt", alt / 1000)

            elif mtype == "VFR_HUD":
                update_state("speed", data.get("groundspeed"))
                update_state("heading", data.get("heading"))

            elif mtype == "BATTERY_STATUS":
                update_state("battery", data.get("battery_remaining"))

            elif mtype == "HEARTBEAT":
                base_mode = data.get("base_mode", 0)
                armed = (base_mode & 128) > 0
                update_state("armed", bool(armed))
                update_state("mode", data.get("custom_mode"))

            # Broadcast update to WebSocket clients
            try:
                await on_update_callback()
            except Exception as e:
                log(f"Broadcast error: {e}")

        except Exception as e:
            log(f"Parser error: {e}")
            await asyncio.sleep(0.1)
