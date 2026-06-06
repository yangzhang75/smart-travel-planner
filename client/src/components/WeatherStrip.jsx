import { useEffect, useState } from "react";

const codeToEmoji = (code) => {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌡️";
};

const dayLabel = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

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

export default function WeatherStrip({ destination, dateStart, dateEnd }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const coords = await geocode(destination);
        if (cancelled) return;
        if (!coords) throw new Error("Could not find location");

        const today = new Date();
        const todayIso = today.toISOString().slice(0, 10);
        const maxForecast = new Date(today.getTime() + 15 * 86400000);

        let start = dateStart || todayIso;
        let end = dateEnd || new Date(today.getTime() + 3 * 86400000).toISOString().slice(0, 10);
        if (new Date(start) < today) start = todayIso;
        if (new Date(end) > maxForecast) end = maxForecast.toISOString().slice(0, 10);
        if (new Date(end) < new Date(start)) end = start;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weather_code,temperature_2m_max&temperature_unit=fahrenheit&timezone=auto&start_date=${start}&end_date=${end}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather API ${res.status}`);
        const data = await res.json();
        const out = (data.daily?.time || []).slice(0, 4).map((d, i) => ({
          date: d,
          code: data.daily.weather_code[i],
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
        }));
        if (cancelled) return;
        setDays(out);
      } catch (err) {
        if (!cancelled) setError(err.message || "Weather unavailable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [destination, dateStart, dateEnd]);

  if (loading) {
    return (
      <div className="weatherRow">
        <div style={{ color: "#888", fontSize: 13 }}>Loading weather…</div>
      </div>
    );
  }

  if (error || days.length === 0) {
    return (
      <div className="weatherRow">
        <div style={{ color: "#888", fontSize: 13 }}>
          {error || "No forecast available for these dates"}
        </div>
      </div>
    );
  }

  return (
    <div className="weatherRow">
      {days.map((d) => (
        <div key={d.date}>
          <span>{dayLabel(d.date)}</span>
          <div className="weatherIcon" style={{ fontSize: 28, lineHeight: 1 }}>
            {codeToEmoji(d.code)}
          </div>
          {d.tempMax}°
        </div>
      ))}
    </div>
  );
}
