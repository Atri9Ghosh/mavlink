import useTelemetry from "../hooks/useTelemetry";
import MapboxPanel from "./MapboxPanel";
import TelemetryPanel from "./TelemetryPanel";
import ChartsPanel from "./ChartsPanel";
import AlertsPanel from "./AlertsPanel";

export default function Dashboard() {
  const telemetry = useTelemetry();

  return (
    <>
      <div className="navbar">
        <div className="nav-title">Cloud Drone GCS</div>

        <div className={`status-pill ${telemetry ? "status-online" : "status-offline"}`}>
          ● {telemetry ? "Online" : "Offline"}
        </div>
      </div>

      <div className="dashboard">
        <div className="map-container">
          <MapboxPanel telemetry={telemetry} />
        </div>

        <div className="sidebar">
          <TelemetryPanel telemetry={telemetry} />
          <ChartsPanel telemetry={telemetry} />
          <AlertsPanel telemetry={telemetry} />
        </div>
      </div>
    </>
  );
}
