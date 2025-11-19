import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from "recharts";

export default function ChartsPanel({ telemetry }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!telemetry) return;

    const alt = Number(telemetry.alt) || 0;
    const speed = Number(telemetry.speed) || 0;
    const battery = Number(telemetry.battery) || 0;

    setData((prev) => [
      ...prev.slice(-80),
      {
        t: new Date().toLocaleTimeString(),
        alt,
        speed,
        battery,
      },
    ]);
  }, [telemetry]);

  return (
    <div className="panel">
      <div className="panel-title">Live Charts</div>

      <ChartBox title="Altitude (m)" data={data} datakey="alt" color="#4ADE80" />
      <ChartBox title="Speed (m/s)" data={data} datakey="speed" color="#60A5FA" />
      <ChartBox title="Battery (%)" data={data} datakey="battery" color="#F87171" />
    </div>
  );
}

function ChartBox({ title, data, datakey, color }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "13px", color: "#aaa" }}>{title}</div>

      <div style={{ width: "100%", height: "120px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#333" />
            <Tooltip />
            <Line type="monotone" dataKey={datakey} stroke={color} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
