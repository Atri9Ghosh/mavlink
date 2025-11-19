export default function TelemetryPanel({ telemetry }) {
  return (
    <div className="panel">
      <div className="panel-title">Telemetry</div>

      {!telemetry && <div>No telemetry yet…</div>}

      {telemetry && (
        <>
          <Item label="Latitude" value={telemetry.lat?.toFixed(6)} />
          <Item label="Longitude" value={telemetry.lon?.toFixed(6)} />
          <Item label="Altitude (m)" value={telemetry.alt} />
          <Item label="Speed (m/s)" value={telemetry.speed} />
          <Item label="Heading" value={telemetry.heading} />
          <Item label="Battery (%)" value={telemetry.battery} />
          <Item label="Mode" value={telemetry.mode} />
          <Item label="Armed" value={telemetry.armed ? "Yes" : "No"} />
        </>
      )}
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="telemetry-item">
      <div className="telemetry-label">{label}</div>
      <div className="telemetry-value">{value ?? "—"}</div>
    </div>
  );
}
