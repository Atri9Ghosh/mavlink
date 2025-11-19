
from pymavlink import mavutil
from utils.config import MAVLINK_CONNECTION
from utils.logger import log
import time

def connect_mavlink():
    """Connect to MAVLink device (PX4 SITL)"""
    log("Connecting to MAVLink:", MAVLINK_CONNECTION)
    
    try:
        
        mav = mavutil.mavlink_connection(
            MAVLINK_CONNECTION,
            source_system=255,
            source_component=0,
            autoreconnect=True,
            dialect='common'
        )
        
        log("Waiting for Heartbeat from PX4...")
        log("(Make sure PX4 SITL is running and configured to send to Windows host)")
        
        
        msg = mav.wait_heartbeat(timeout=15)
        
        if msg:
            log(f"✓ MAVLink Connected!")
            log(f"  System ID: {mav.target_system}, Component: {mav.target_component}")
            log(f"  Vehicle Type: {msg.type}, Autopilot: {msg.autopilot}")
            log(f"  Base Mode: {msg.base_mode}, Custom Mode: {msg.custom_mode}")
            return mav
        else:
            log("✗ No heartbeat received within 15 seconds")
            log("  Check that:")
            log("  1. PX4 SITL is running")
            log("  2. PX4 is configured to send MAVLink to Windows host IP")
            log("  3. Firewall is not blocking UDP port 14550")
            raise ConnectionError("MAVLink connection timeout - no heartbeat received")
        
    except ConnectionError:
        raise
    except Exception as e:
        log(f"✗ MAVLink Connection Failed: {e}")
        log(f"  Connection string: {MAVLINK_CONNECTION}")
        raise