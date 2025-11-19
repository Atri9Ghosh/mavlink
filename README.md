# MAVLink Ground Control Station (GCS)

A real-time web-based Ground Control Station for monitoring and visualizing drone telemetry data from PX4 SITL (Software In The Loop) simulator.

## Features

- 🗺️ **Interactive 3D Map** - Real-time drone position tracking on Mapbox with 3D terrain
- 📊 **Live Telemetry** - Real-time display of position, altitude, speed, heading, battery, and more
- 📈 **Live Charts** - Dynamic charts for altitude, speed, and battery levels
- 🚨 **Alert System** - Real-time alerts for system status, battery levels, and GPS
- 🔄 **WebSocket Communication** - Low-latency real-time data streaming
- 🎨 **Modern UI** - Dark-themed, responsive interface

## Architecture

```
Frontend (React + Vite) → WebSocket → Backend (FastAPI) → MAVLink → PX4 SITL
```

## Prerequisites

- **Python 3.8+** (tested with Python 3.14)
- **Node.js 16+** and npm
- **PX4 SITL** running in Ubuntu/WSL
- **Mapbox API Token** (free tier available)

## Project Structure

```
MAVLink/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI app and WebSocket endpoint
│   ├── mavlink/            # MAVLink connection and parsing
│   │   ├── connection.py  # MAVLink connection handler
│   │   ├── parser.py       # MAVLink message parser
│   │   └── telemetry_state.py  # Telemetry state management
│   ├── ws/                 # WebSocket management
│   │   ├── manager.py      # WebSocket client manager
│   │   └── broadcaster.py # Telemetry broadcaster
│   ├── utils/              # Utilities
│   │   ├── config.py       # Configuration
│   │   └── logger.py      # Logging utility
│   └── requirements.txt    # Python dependencies
│
├── frontend/                # React frontend
│   └── gcs-frontend/
│       ├── src/
│       │   ├── components/ # React components
│       │   │   ├── Dashboard.jsx
│       │   │   ├── MapboxPanel.jsx
│       │   │   ├── TelemetryPanel.jsx
│       │   │   ├── ChartsPanel.jsx
│       │   │   └── AlertsPanel.jsx
│       │   ├── hooks/
│       │   │   └── useTelemetry.js  # WebSocket hook
│       │   └── config.js   # Frontend configuration
│       └── package.json
│
└── README.md
```

## Installation

### 1. Clone or Navigate to Project

```bash
cd C:\Users\atrig\OneDrive\Desktop\MAVLink
```

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend/gcs-frontend
npm install
```

### 4. Configure Mapbox Token

Edit `frontend/gcs-frontend/src/config.js` and update your Mapbox token:

```javascript
export const MAPBOX_TOKEN = "your_mapbox_token_here";
```

Get a free token at: https://account.mapbox.com/

## Configuration

### Backend Configuration

Edit `backend/utils/config.py`:

```python
# For PX4 in WSL, listen for incoming UDP packets
MAVLINK_CONNECTION = "udpin:0.0.0.0:14550"
```

### Frontend Configuration

Edit `frontend/gcs-frontend/src/config.js`:

```javascript
export const WS_URL = "ws://localhost:8000/ws";
export const INITIAL_CENTER = [72.8777, 19.0760]; // Default map center
```

## Running the Application

### Option 1: Use the Batch Script (Windows)

Double-click `START_ALL.bat` in the project root.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend/gcs-frontend
npm run dev
```

### Option 3: Individual Commands

**Backend:**
```powershell
cd C:\Users\atrig\OneDrive\Desktop\MAVLink\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```powershell
cd C:\Users\atrig\OneDrive\Desktop\MAVLink\frontend\gcs-frontend
npm run dev
```

## PX4 SITL Configuration (WSL/Ubuntu)

Since PX4 runs in WSL and the backend runs on Windows, you need to configure PX4 to send MAVLink data to the Windows host IP.

### Step 1: Get Windows Host IP

From WSL/Ubuntu terminal:
```bash
ip route show | grep -i default | awk '{ print $3}'
# Example output: 172.27.64.1
```

### Step 2: Configure PX4 MAVLink

In your PX4 console (pxh>):
```bash
# Stop current MAVLink
mavlink stop-all

# Start MAVLink sending to Windows host IP
# Replace 172.27.64.1 with your Windows host IP from Step 1
mavlink start -x -u 14550 -r 4000000 -m onboard -t 172.27.64.1 -o 14550

# Enable required data streams
mavlink stream -u 14550 -s HEARTBEAT -r 1
mavlink stream -u 14550 -s GLOBAL_POSITION_INT -r 10
mavlink stream -u 14550 -s VFR_HUD -r 5
mavlink stream -u 14550 -s BATTERY_STATUS -r 1

# Verify connection
mavlink status
```

Expected output should show:
- `partner IP: 172.27.64.1` (your Windows host IP)
- `tx: [number] B/s` (data being sent)

## Accessing the Application

Once both servers are running:

- **Frontend:** http://localhost:5173
- **Backend API Docs:** http://localhost:8000/docs
- **WebSocket Endpoint:** ws://localhost:8000/ws

## Verification

### Backend Logs

You should see in the backend terminal:
```
[HH:MM:SS] Connecting to MAVLink: udpin:0.0.0.0:14550
[HH:MM:SS] Waiting for Heartbeat from PX4...
[HH:MM:SS] ✓ MAVLink Connected!
  System ID: 1, Component: 1
  Vehicle Type: 2, Autopilot: 3
```

### Frontend Status

- Status indicator should change from **"Offline"** (red) to **"Online"** (green)
- Telemetry data should appear (latitude, longitude, altitude, speed, etc.)
- Map should show drone position
- Charts should update in real-time

## Troubleshooting

### Backend Not Starting

1. **Check Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Check if port 8000 is in use:**
   ```powershell
   netstat -ano | findstr ":8000"
   ```

3. **Verify Python installation:**
   ```bash
   python --version
   ```

### Frontend Not Starting

1. **Check Node.js and npm:**
   ```bash
   node --version
   npm --version
   ```

2. **Reinstall dependencies:**
   ```bash
   cd frontend/gcs-frontend
   rm -rf node_modules
   npm install
   ```

3. **Check if port 5173 is in use:**
   ```powershell
   netstat -ano | findstr ":5173"
   ```

### No Data in Frontend

1. **Check WebSocket connection:**
   - Open browser DevTools (F12)
   - Check Console for WebSocket connection errors
   - Should see: `[WS] Connected`

2. **Verify PX4 is sending data:**
   ```bash
   mavlink status
   ```
   Should show `tx: [number] B/s` (not 0.0)

3. **Check backend logs:**
   - Look for MAVLink connection errors
   - Verify heartbeat is received

4. **Verify Windows Firewall:**
   - Allow UDP port 14550
   - Allow TCP port 8000

### PX4 Connection Issues

1. **Verify Windows host IP:**
   ```bash
   # From WSL
   ip route show default
   ```

2. **Test UDP connectivity:**
   ```bash
   # From WSL, test if Windows can receive UDP
   echo "test" | nc -u 172.27.64.1 14550
   ```

3. **Check PX4 MAVLink status:**
   ```bash
   mavlink status
   ```
   Should show `partner IP: [Windows IP]` not `127.0.0.1`

## Data Flow

1. **PX4 SITL** sends MAVLink messages via UDP to Windows host (port 14550)
2. **Backend** receives and parses MAVLink messages:
   - `GLOBAL_POSITION_INT` → latitude, longitude, altitude
   - `VFR_HUD` → speed, heading
   - `BATTERY_STATUS` → battery percentage
   - `HEARTBEAT` → armed status, flight mode
3. **Backend** updates telemetry state and broadcasts via WebSocket
4. **Frontend** receives updates and displays:
   - Map with drone position and flight path
   - Telemetry panel with current values
   - Live charts for altitude, speed, battery
   - Alerts for system status

## Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **PyMAVLink** - MAVLink protocol implementation
- **WebSockets** - Real-time bidirectional communication
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Mapbox GL JS** - Interactive maps
- **Recharts** - Chart library

## Development

### Backend Development

```bash
cd backend
python -m uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend/gcs-frontend
npm run dev
```

## License

This project is for educational and development purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Check backend and frontend logs for errors
4. Ensure PX4 is properly configured to send to Windows host IP

## Notes

- The backend listens on `udpin:0.0.0.0:14550` to receive UDP packets from PX4
- PX4 must be configured to send to the Windows host IP (not 127.0.0.1)
- The frontend automatically connects to the WebSocket on load
- Map center can be adjusted in `frontend/gcs-frontend/src/config.js`

