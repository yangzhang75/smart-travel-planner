import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default marker icon paths when bundled by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl, shadowUrl });

const geocodeCache = new Map();
async function geocode(query) {
  if (geocodeCache.has(query)) return geocodeCache.get(query);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    );
    const data = await res.json();
    const coord = data?.[0]
      ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      : null;
    geocodeCache.set(query, coord);
    return coord;
  } catch {
    return null;
  }
}

function FitToBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [points, map]);
  return null;
}

export default function TripMap({ destination, stops }) {
  const [center, setCenter] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const stopsKey = (stops || []).map((s) => s.title).join("|");

  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const base = await geocode(destination);
      if (cancelled) return;
      if (base) setCenter(base);

      const results = [];
      for (const stop of stops || []) {
        if (cancelled) return;
        const coord = await geocode(`${stop.title}, ${destination}`);
        if (coord) results.push({ ...coord, title: stop.title, time: stop.time });
        // Nominatim ToS: 1 request/sec
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (cancelled) return;
      setMarkers(results);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [destination, stopsKey]);

  if (!center) {
    return (
      <div
        className="mapBox"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}
      >
        {loading ? "Loading map…" : "Map unavailable"}
      </div>
    );
  }

  return (
    <div className="mapBox" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ height: "100%", width: "100%", minHeight: 240 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker key={`${m.title}-${i}`} position={[m.lat, m.lng]}>
            <Popup>
              <strong>{m.title}</strong>
              {m.time && <div style={{ fontSize: 12, color: "#666" }}>{m.time}</div>}
            </Popup>
          </Marker>
        ))}
        <FitToBounds points={markers.length > 0 ? markers : [center]} />
      </MapContainer>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(255,255,255,0.9)",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 12,
            color: "#666",
            zIndex: 1000,
          }}
        >
          Loading markers…
        </div>
      )}
    </div>
  );
}
