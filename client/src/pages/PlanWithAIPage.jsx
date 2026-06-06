import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, auth } from "../utils/api";
import TripMap from "../components/TripMap";
import WeatherStrip from "../components/WeatherStrip";
import { useToast } from "../components/Toast";
import "../styles/planWithAI.css";

const parseCost = (s) => {
  if (!s) return 0;
  const cleaned = String(s).replace(/[^\d.]/g, "");
  return parseFloat(cleaned) || 0;
};

const nextDateAfter = (lastDateStr) => {
  if (!lastDateStr) return "";
  const withYear = `${lastDateStr}, ${new Date().getFullYear()}`;
  const d = new Date(withYear);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const emptyStop = { time: "", title: "", type: "", description: "", duration: "", cost: "" };

const loadingSteps = [
  "Researching destinations",
  "Analyzing your preferences",
  "Optimizing daily schedule",
  "Estimating budget breakdown",
  "Finalizing your itinerary",
];

const sampleDays = [
  { day: "Day 1", date: "Sat, Jul 12", stops: 4 },
  { day: "Day 2", date: "Sun, Jul 13", stops: 3 },
  { day: "Day 3", date: "Mon, Jul 14", stops: 4 },
];

const sampleStops = [
  {
    time: "9:00",
    title: "Tsukiji Outer Market",
    type: "Food & Market · Chuo",
    desc: "Explore fresh sushi stalls and local vendors.",
    cost: "¥1,200",
    duration: "2 hrs",
  },
  {
    time: "11:30",
    title: "Senso-ji Temple",
    type: "Temple & Culture · Asakusa",
    desc: "Visit Tokyo’s oldest temple and Nakamise street.",
    cost: "Free",
    duration: "1.5 hrs",
  },
  {
    time: "19:30",
    title: "Dinner at Ichiran Ramen",
    type: "Dining · Shibuya",
    desc: "Enjoy ramen in individual booths.",
    cost: "¥980",
    duration: "2 hrs",
  },
];

export default function PlanWithAIPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { showToast, ToastNode } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [tripData, setTripData] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [rightTab, setRightTab] = useState("map");
  const [showAddStop, setShowAddStop] = useState(false);
  const [newStop, setNewStop] = useState(emptyStop);
  const [savingMutation, setSavingMutation] = useState(false);

  const handleAddDay = async () => {
    if (!tripData?._id) {
      showToast("Wait for the trip to finish loading");
      return;
    }
    const currentDays = tripData.days || [];
    const dayNum = currentDays.length + 1;
    const lastDate = currentDays[currentDays.length - 1]?.date || "";
    const newDay = {
      day: `Day ${dayNum}`,
      date: nextDateAfter(lastDate),
      theme: "New day",
      stops: [],
    };
    setSavingMutation(true);
    try {
      const updated = await api.updateTrip(tripData._id, {
        days: [...currentDays, newDay],
      });
      setTripData(updated);
      setSelectedDayIndex(updated.days.length - 1);
      showToast(`${newDay.day} added`);
    } catch (err) {
      showToast(err.message || "Failed to add day");
    } finally {
      setSavingMutation(false);
    }
  };

  const handleSaveStop = async (e) => {
    e.preventDefault();
    if (!tripData?._id) {
      showToast("Wait for the trip to finish loading");
      return;
    }
    if (!newStop.title.trim()) {
      showToast("Please enter a title");
      return;
    }
    setSavingMutation(true);
    try {
      const updatedDays = (tripData.days || []).map((d, i) =>
        i === safeDayIndex
          ? { ...d, stops: [...(d.stops || []), { ...newStop }] }
          : d
      );
      const updated = await api.updateTrip(tripData._id, { days: updatedDays });
      setTripData(updated);
      setShowAddStop(false);
      setNewStop(emptyStop);
      showToast("Stop added");
    } catch (err) {
      showToast(err.message || "Failed to add stop");
    } finally {
      setSavingMutation(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = tripData?._id
      ? `${window.location.origin}/trip/${tripData._id}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied!");
    } catch {
      showToast("Couldn't copy — clipboard blocked");
    }
  };

  const destination = state?.where || "Tokyo, Japan";
  const dates = state?.dateLabel || "Jul 12–19";
  const travelers = state?.whoLabel || "2 travelers";
  const budget = state?.budgetLabel || "$2,250";

  const days = Array.isArray(tripData?.days) && tripData.days.length > 0 ? tripData.days : sampleDays;
  const safeDayIndex = Math.min(selectedDayIndex, days.length - 1);
  const selectedDay = days[safeDayIndex];
  // Only fall back to sampleStops on day 1; other days show their own stops (or empty state)
  const selectedDayStops = Array.isArray(selectedDay?.stops) ? selectedDay.stops : [];
  const stops = selectedDayStops.length > 0
    ? selectedDayStops
    : safeDayIndex === 0
    ? sampleStops
    : [];

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    async function generateTrip() {
      if (!auth.isAuthed()) {
        navigate("/signin");
        return;
      }
      try {
        const data = await api.planTrip({
          where: state?.where,
          dateLabel: state?.dateLabel,
          whoLabel: state?.whoLabel,
          budgetLabel: state?.budgetLabel,
        });
        setTripData(data);
        setApiError(false);

        setTimeout(() => {
          setLoading(false);
        }, 4500);
      } catch (error) {
        console.error(error);
        if (error.status === 401) {
          navigate("/signin");
          return;
        }
        setApiError(true);
        // Fall back to sample data so the layout is never empty
        setTripData(null);
        setTimeout(() => {
          setLoading(false);
        }, 1200);
      }
    }

    generateTrip();

    return () => clearInterval(stepTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="aiLoadingPage">
        <button
          type="button"
          className="loadingLogo logo logoButton"
          onClick={() => navigate("/home")}
          aria-label="Go to home"
        >
          voyage<span>.ai</span>
        </button>

        <div className="loadingCenter">
          <div className="loadingCircle">AI</div>

          <h1>Building your {destination} trip...</h1>
          <p>
            {dates} · {travelers}
          </p>

          <div className="loadingSteps">
            {loadingSteps.map((step, index) => (
              <div
                key={step}
                className={`loadingStep ${
                  index < activeStep
                    ? "done"
                    : index === activeStep
                    ? "active"
                    : ""
                }`}
              >
                <span className="stepDot">
                  {index < activeStep ? "✓" : index === activeStep ? "●" : ""}
                </span>

                <div>
                  <strong>{step}</strong>
                  <small>
                    {index < activeStep
                      ? "Completed"
                      : index === activeStep
                      ? "Working on this now"
                      : "Waiting"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="loadingBottom">
          <div className="progressTrack">
            <div
              className="progressFill"
              style={{
                width: `${((activeStep + 1) / loadingSteps.length) * 100}%`,
              }}
            />
          </div>
          <button onClick={() => navigate("/home")}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tripDetailPage">
      <header className="tripTopbar">
        <button
          type="button"
          className="tripBrand logo logoButton"
          onClick={() => navigate("/home")}
          aria-label="Go to home"
        >
          voyage<span>.ai</span>
        </button>

        <div className="tripTitle">
          {tripData?.title || `${destination} Adventure`} · {dates}
        </div>

        <div className="tripActions">
          <button onClick={() => window.location.reload()}>Regen</button>
          <button onClick={handleShare}>Share</button>
        </div>
      </header>

      {apiError && (
        <div className="apiErrorBanner" role="status">
          Couldn't reach AI right now. Showing sample itinerary.
        </div>
      )}

      <div className="tripLayout">
        <aside className="tripSidebar">
          <p className="sidebarLabel">ITINERARY</p>

          {days.map((d, index) => (
            <button
              key={d.day || index}
              type="button"
              className={`dayItem ${index === safeDayIndex ? "active" : ""}`}
              onClick={() => setSelectedDayIndex(index)}
            >
              <strong>{d.day || `Day ${index + 1}`}</strong>
              <span>{d.date}</span>
              <small>
                {Array.isArray(d.stops) ? d.stops.length : (d.stops || 0)} stops
              </small>
            </button>
          ))}

          <button className="addDay" onClick={handleAddDay} disabled={savingMutation}>
            {savingMutation ? "Adding…" : "+ Add day"}
          </button>
        </aside>

        <main className="tripMain">
          <div className="dayHeader">
            <div>
              <h1>
                {selectedDay?.day || "Day 1"} —{" "}
                {selectedDay?.theme || "Arrival & Explore"}
              </h1>
              <p>
                {selectedDay?.date || "Your first day"} · {stops.length}{" "}
                activities planned
              </p>
            </div>

            <button onClick={() => setShowAddStop(true)}>+ Add a stop</button>
          </div>

          <div className="stopList">
            {Array.isArray(stops) && stops.length > 0 ? (
              stops.map((stop, index) => {
                const desc = stop.description || stop.desc;
                return (
                  <article className="stopCard" key={stop.title ? `${stop.title}-${index}` : index}>
                    <div className="dragDots">⋮</div>

                    <div className="stopTime">
                      <strong>{stop.time || "—"}</strong>
                      {stop.duration && <span>{stop.duration}</span>}
                    </div>

                    <div className="stopInfo">
                      <h3>{stop.title || "Untitled stop"}</h3>
                      {stop.type && <p className="stopType">{stop.type}</p>}
                      {desc && <p className="stopDescPlan">{desc}</p>}
                    </div>

                    {stop.cost && <div className="stopCost">{stop.cost}</div>}
                  </article>
                );
              })
            ) : (
              <p className="emptyDay">No activities planned for this day.</p>
            )}
          </div>
        </main>

        <aside className="tripRightPanel">
          <div className="tabs">
            <button
              className={rightTab === "map" ? "active" : ""}
              onClick={() => setRightTab("map")}
            >MAP</button>
            <button
              className={rightTab === "weather" ? "active" : ""}
              onClick={() => setRightTab("weather")}
            >WEATHER</button>
            <button
              className={rightTab === "budget" ? "active" : ""}
              onClick={() => setRightTab("budget")}
            >BUDGET</button>
          </div>

          {rightTab === "map" && (
            <>
              <TripMap destination={destination} stops={stops} />
              <WeatherStrip
                destination={destination}
                dateStart={state?.dateStart}
                dateEnd={state?.dateEnd}
              />
            </>
          )}

          {rightTab === "weather" && (
            <div style={{ padding: "16px 0" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Forecast for {destination}
              </h3>
              <WeatherStrip
                destination={destination}
                dateStart={state?.dateStart}
                dateEnd={state?.dateEnd}
              />
              <p style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
                Live data from Open-Meteo. Forecasts available up to 16 days out.
              </p>
            </div>
          )}

          {rightTab === "budget" && (() => {
            const dayCosts = days.map((d) =>
              (d.stops || []).reduce((sum, s) => sum + parseCost(s.cost), 0)
            );
            const totalSpent = dayCosts.reduce((a, b) => a + b, 0);
            const budgetTotal =
              parseCost(tripData?.budget?.total) || parseCost(state?.budgetLabel) || parseCost(budget) || 0;
            const remaining = budgetTotal - totalSpent;
            const pct = budgetTotal > 0 ? Math.min(100, Math.round((totalSpent / budgetTotal) * 100)) : 0;
            const overBudget = remaining < 0;
            return (
              <div style={{ padding: "8px 0" }}>
                <div
                  style={{
                    padding: 16,
                    background: "#f7f5f0",
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 11, color: "#888", letterSpacing: 0.5 }}>TOTAL BUDGET</div>
                  <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>
                    ${budgetTotal.toLocaleString()}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#888" }}>SPENT</div>
                      <div style={{ fontSize: 20, fontWeight: 600 }}>
                        ${totalSpent.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#888" }}>
                        {overBudget ? "OVER BUDGET" : "REMAINING"}
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: overBudget ? "#b00020" : "#2e7d32",
                        }}
                      >
                        {overBudget ? "−" : ""}${Math.abs(remaining).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      height: 8,
                      background: "#e5e1d6",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: overBudget ? "#b00020" : "#5b8def",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>{pct}% of budget</div>
                </div>

                <div>
                  <h4
                    style={{
                      fontSize: 11,
                      color: "#888",
                      letterSpacing: 0.5,
                      margin: "0 0 8px 0",
                    }}
                  >
                    PER DAY
                  </h4>
                  {days.map((d, i) => (
                    <div
                      key={d.day || i}
                      onClick={() => setSelectedDayIndex(i)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 4px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                        background: i === safeDayIndex ? "#f7f5f0" : "transparent",
                        borderRadius: 6,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {d.day || `Day ${i + 1}`}
                        </div>
                        {d.date && (
                          <div style={{ fontSize: 11, color: "#888" }}>{d.date}</div>
                        )}
                      </div>
                      <strong style={{ fontSize: 16 }}>
                        ${dayCosts[i].toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </aside>
      </div>

      {showAddStop && (
        <div
          onClick={() => !savingMutation && setShowAddStop(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveStop}
            style={{
              background: "white", borderRadius: 12, padding: 24,
              width: "90%", maxWidth: 460, boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
              display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <h2 style={{ margin: "0 0 4px 0", fontSize: 20 }}>Add a stop</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
              Adding to {selectedDay?.day || "current day"}.
            </p>

            <label style={{ fontSize: 12, color: "#555" }}>
              Time
              <input
                value={newStop.time}
                onChange={(e) => setNewStop((s) => ({ ...s, time: e.target.value }))}
                placeholder="e.g. 9:00"
                style={inputStyle}
              />
            </label>

            <label style={{ fontSize: 12, color: "#555" }}>
              Title <span style={{ color: "#b00020" }}>*</span>
              <input
                value={newStop.title}
                onChange={(e) => setNewStop((s) => ({ ...s, title: e.target.value }))}
                placeholder="e.g. Tsukiji Outer Market"
                required
                autoFocus
                style={inputStyle}
              />
            </label>

            <label style={{ fontSize: 12, color: "#555" }}>
              Type
              <input
                value={newStop.type}
                onChange={(e) => setNewStop((s) => ({ ...s, type: e.target.value }))}
                placeholder="e.g. Food & Market · Chuo"
                style={inputStyle}
              />
            </label>

            <label style={{ fontSize: 12, color: "#555" }}>
              Description
              <textarea
                value={newStop.description}
                onChange={(e) => setNewStop((s) => ({ ...s, description: e.target.value }))}
                placeholder="What you'll do here..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ fontSize: 12, color: "#555" }}>
                Duration
                <input
                  value={newStop.duration}
                  onChange={(e) => setNewStop((s) => ({ ...s, duration: e.target.value }))}
                  placeholder="e.g. 2 hrs"
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 12, color: "#555" }}>
                Cost
                <input
                  value={newStop.cost}
                  onChange={(e) => setNewStop((s) => ({ ...s, cost: e.target.value }))}
                  placeholder="e.g. $20"
                  style={inputStyle}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowAddStop(false)}
                disabled={savingMutation}
                style={btnSecondaryStyle}
              >
                Cancel
              </button>
              <button type="submit" disabled={savingMutation} style={btnPrimaryStyle}>
                {savingMutation ? "Saving…" : "Save stop"}
              </button>
            </div>
          </form>
        </div>
      )}

      {ToastNode}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "8px 10px",
  fontSize: 14,
  border: "1px solid #ddd",
  borderRadius: 6,
  boxSizing: "border-box",
};

const btnPrimaryStyle = {
  padding: "8px 16px",
  background: "#1a1a1a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
};

const btnSecondaryStyle = {
  padding: "8px 16px",
  background: "white",
  color: "#333",
  border: "1px solid #ddd",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
};
