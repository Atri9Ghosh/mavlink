import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN, INITIAL_CENTER } from "../config";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapboxPanel({ telemetry }) {
  const mapDiv = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const path = useRef([]);
  const lastAlt = useRef(0);
  const [mapStyle, setMapStyle] = useState("dark");
  const [followDrone, setFollowDrone] = useState(true);

  // Toggle Day/Night
  const toggleStyle = () => {
    if (!map.current) return;

    setMapStyle((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      const styleURL =
        next === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11";

      map.current.setStyle(styleURL);

      const rebuildLayers = () => {
        add3D();
        addSky();
        addPathLayer();
      };

      map.current.once("style.load", rebuildLayers);
      return next;
    });
  };

  // Add 3D Terrain + Sky layer
  function add3D() {
    if (!map.current.getSource("mapbox-dem")) {
      map.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    }

    map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.3 });
  }

  function addSky() {
    if (!map.current.getLayer("sky")) {
      map.current.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-color": "#88c0ff",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });
    }
  }

  function addPathLayer() {
    if (map.current.getSource("dronePath")) return;

    map.current.addSource("dronePath", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: [] },
      },
    });

    map.current.addLayer({
      id: "dronePathLine",
      type: "line",
      source: "dronePath",
      paint: {
        "line-color": "#00eaff",
        "line-width": 3,
      },
    });
  }

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapDiv.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: INITIAL_CENTER,
      zoom: 12,
      pitch: 55,
      bearing: 0,
      antialias: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    const handleManualControl = () => setFollowDrone(false);
    ["dragstart", "rotatestart", "pitchstart", "zoomstart"].forEach((evt) => {
      map.current.on(evt, handleManualControl);
    });

    map.current.on("load", () => {
      add3D();
      addSky();
      addPathLayer();
    });

    return () => {
      if (!map.current) return;
      ["dragstart", "rotatestart", "pitchstart", "zoomstart"].forEach((evt) => {
        map.current.off(evt, handleManualControl);
      });
      map.current.remove();
      map.current = null;
    };
  }, []);

  // Update drone marker
  useEffect(() => {
    if (
      !telemetry ||
      telemetry.lat == null ||
      telemetry.lon == null ||
      !map.current
    )
      return;

    const lng = telemetry.lon;
    const lat = telemetry.lat;
    const heading = telemetry.heading ?? 0;
    const alt = telemetry.alt ?? 0;

    // Create drone marker once with inline SVG so it always renders
    if (!marker.current) {
      const el = document.createElement("div");
      el.className = "drone-marker";
      el.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2l6 14h-4v14h-4V16h-4z" fill="#00eaff" stroke="#09141f" stroke-width="1.2" />
        </svg>
      `;
      marker.current = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }

    marker.current.setLngLat([lng, lat]);

    const el = marker.current.getElement();
    el.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;

    // Flight path update
    path.current.push([lng, lat]);
    if (path.current.length > 200) path.current.shift();

    const src = map.current.getSource("dronePath");
    if (src) {
      src.setData({
        type: "Feature",
        geometry: { type: "LineString", coordinates: path.current },
      });
    }

    // Animated "takeoff" effect (feature #7)
    if (alt > lastAlt.current + 0.5) {
      const el = marker.current.getElement();
      el.classList.add("drone-takeoff");
      setTimeout(() => el.classList.remove("drone-takeoff"), 600);
    }
    lastAlt.current = alt;

    if (followDrone) {
      map.current.easeTo({
        center: [lng, lat],
        duration: 700,
        easing: (t) => t * (2 - t),
      });
      map.current.rotateTo(heading, { duration: 700 });
    }
  }, [telemetry, followDrone]);

  // Zoom-to-drone (feature #1)
  const zoomToDrone = () => {
    if (!telemetry?.lat || !telemetry?.lon || !map.current) return;
    setFollowDrone(true);
    map.current.flyTo({
      center: [telemetry.lon, telemetry.lat],
      zoom: 16,
      duration: 900,
      essential: true,
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Zoom Button (feature 1) */}
      <button className="zoom-btn" onClick={zoomToDrone}>
        ⬤ {followDrone ? "Center Drone" : "Resume Follow"}
      </button>

      {/* Day/Night toggle (feature 4) */}
      <button className="mode-toggle" onClick={toggleStyle}>
        {mapStyle === "dark" ? "☀ Light" : "🌙 Dark"}
      </button>

      {/* Map */}
      <div ref={mapDiv} className="mapbox-surface" />
    </div>
  );
}
