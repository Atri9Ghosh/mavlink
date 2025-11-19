export default function AlertsPanel({ telemetry }) {
  const alerts = [];

  if (!telemetry) {
    alerts.push({ type: "error", text: "No telemetry" });
  } else {
    const lat = Number(telemetry.lat);
    const battery = Number(telemetry.battery);
    const armed = telemetry.armed;

    // Drone armed?
    if (!armed) alerts.push({ type: "warn", text: "Drone disarmed" });

    // Low battery?
    if (!isNaN(battery) && battery < 30)
      alerts.push({ type: "warn", text: "Low battery" });

    // GPS fix?
    if (isNaN(lat)) alerts.push({ type: "error", text: "GPS lost" });

    // Everything OK?
    if (alerts.length === 0)
      alerts.push({ type: "ok", text: "All systems normal" });
  }

  return (
    <div className="panel">
      <div className="panel-title">Alerts</div>

      {alerts.map((a, i) => (
        <div
          key={i}
          className={
            "alert " +
            (a.type === "ok"
              ? "alert-ok"
              : a.type === "warn"
              ? "alert-warn"
              : "alert-error")
          }
        >
          {a.text}
        </div>
      ))}
    </div>
  );
}
