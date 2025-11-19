import { useEffect, useState, useRef } from "react";
import { WS_URL } from "../config";

export default function useTelemetry() {
  const [telemetry, setTelemetry] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => console.log("[WS] Connected");
    ws.current.onclose = () => console.log("[WS] Disconnected");
    ws.current.onerror = (err) => console.log("[WS] Error:", err);

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Your state keys match exactly, so no translation needed:
        setTelemetry({
          lat: data.lat ?? null,
          lon: data.lon ?? null,
          alt: data.alt ?? null,
          speed: data.speed ?? null,
          heading: data.heading ?? null,
          battery: data.battery ?? null,
          armed: data.armed ?? false,
          mode: data.mode ?? "UNKNOWN"
        });

      } catch (e) {
        console.log("Failed to parse msg:", e);
      }
    };

    return () => ws.current && ws.current.close();
  }, []);

  return telemetry;
}
