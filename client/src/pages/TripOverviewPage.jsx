import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icons";
import { useToast } from "../components/Toast";
import { api, auth } from "../utils/api";
import "../styles/tripOverview.css";

const parseCost = (s) => {
  if (!s) return 0;
  const cleaned = String(s).replace(/[^\d.]/g, "");
  return parseFloat(cleaned) || 0;
};

const parseTravelers = (whoLabel) => {
  const m = String(whoLabel || "").match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
};

// Adapt a real backend Trip into the shape this page renders
function adaptTrip(t, viewerName) {
  const days = (t.days || []).map((d, i) => ({
    day: i + 1,
    theme: d.theme || `Day ${i + 1}`,
    date: d.date,
    stops: (d.stops || []).map((s) => ({
      time: s.time,
      title: s.title,
      type: s.type,
      desc: s.description || s.desc,
      duration: s.duration,
      cost: s.cost,
    })),
  }));
  const totalStops = days.reduce((a, d) => a + (d.stops?.length || 0), 0);
  const totalCost = parseCost(t.budget?.total) || days.reduce(
    (a, d) => a + (d.stops || []).reduce((b, s) => b + parseCost(s.cost), 0),
    0
  );
  const restaurantCount = days.reduce(
    (a, d) => a + (d.stops || []).filter((s) => /food|restaurant|dining|cafe/i.test(s.type || "")).length,
    0
  );
  return {
    _id: t._id,
    id: t._id,
    title: t.title || t.where || "Trip",
    dateRange: t.dateLabel || "",
    travelers: parseTravelers(t.whoLabel),
    vibe: t.budgetLabel || "Custom itinerary",
    sharedBy: viewerName || "You",
    totals: {
      days: days.length,
      stops: totalStops,
      cost: Math.round(totalCost),
    },
    stats: {
      weather: "—",
      dailyCost: days.length > 0 ? Math.round(totalCost / days.length) : 0,
      walking: "—",
      restaurants: restaurantCount,
    },
    days,
  };
}

function formatSyncDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function dayPillLabel(date) {
  if (!date || typeof date !== "string") return "";
  const m = date.match(/^(\w{3,})day,\s*(\w+)\s+(\d+)/i);
  if (!m) return date;
  const [, weekday, month, dayNum] = m;
  return `${weekday.slice(0, 3)} ${month} ${dayNum}`;
}

export default function TripOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [lastSynced, setLastSynced] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const { showToast, ToastNode } = useToast();

  useEffect(() => {
    if (!auth.isAuthed()) { navigate("/signin"); return; }
    if (!id) return;
    let cancelled = false;
    const cacheKey = `voyage_trip_${id}`;

    // Show cached data immediately if present, while we fetch fresh
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setTrip(parsed.data);
        setLastSynced(parsed.syncedAt);
        setLoading(false);
      } catch { /* corrupt cache — ignore */ }
    }

    if (!navigator.onLine) {
      if (!cached) {
        setError("You're offline and this trip hasn't been cached yet.");
        setLoading(false);
      }
      return;
    }

    (async () => {
      try {
        const data = await api.getTrip(id);
        if (cancelled) return;
        const viewerName = auth.getUser()?.name || "You";
        const adapted = adaptTrip(data, viewerName);
        const syncedAt = new Date().toISOString();
        setTrip(adapted);
        setLastSynced(syncedAt);
        setError("");
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data: adapted, syncedAt }));
        } catch { /* storage full — silently degrade */ }
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) { navigate("/signin"); return; }
        if (err.status === 404) setError("Trip not found");
        else if (err.status === 400) setError("Invalid trip ID");
        else setError(err.message || "Couldn't load this trip");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, navigate]);

  useEffect(() => {
    const onUp = () => setIsOnline(true);
    const onDown = () => setIsOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied!");
    } catch {
      showToast("Couldn't copy link");
    }
  };

  const [duplicating, setDuplicating] = useState(false);
  const duplicateTrip = async () => {
    if (!trip) return;
    if (!auth.isAuthed()) {
      showToast("Please sign in to duplicate this trip");
      navigate("/signin");
      return;
    }
    setDuplicating(true);
    try {
      // Normalize sample-shape days (stop.desc → stop.description) for the backend schema
      const normalizedDays = (Array.isArray(trip.days) ? trip.days : []).map((d) => ({
        day: typeof d.day === "number" ? `Day ${d.day}` : d.day,
        date: d.date,
        theme: d.theme,
        stops: (d.stops || []).map((s) => ({
          time: s.time,
          title: s.title,
          type: s.type,
          description: s.description || s.desc || "",
          duration: s.duration,
          cost: s.cost,
        })),
      }));
      const newTrip = await api.createTrip({
        title: `${trip.title} (copy)`,
        where: trip.title,
        days: normalizedDays,
      });
      showToast("Trip duplicated to your account");
      navigate(`/trip/${newTrip._id}`);
    } catch (err) {
      showToast(err.message || "Couldn't duplicate trip");
    } finally {
      setDuplicating(false);
    }
  };

  const syncNow = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    try {
      const data = await api.getTrip(id);
      const viewerName = auth.getUser()?.name || "You";
      const adapted = adaptTrip(data, viewerName);
      const syncedAt = new Date().toISOString();
      setTrip(adapted);
      setLastSynced(syncedAt);
      try {
        localStorage.setItem(`voyage_trip_${id}`, JSON.stringify({ data: adapted, syncedAt }));
      } catch { /* noop */ }
      showToast("Trip synced");
    } catch (err) {
      showToast(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const days = Array.isArray(trip?.days) ? trip.days : [];

  const activeDayData = useMemo(() => {
    if (days.length === 0) return null;
    return days.find((d) => d.day === activeDay) ?? days[0];
  }, [days, activeDay]);

  const activeStops = Array.isArray(activeDayData?.stops) ? activeDayData.stops : [];

  if (loading && !trip) {
    return (
      <div className="tripOverview tripOverviewLoading">
        <button
          type="button"
          className="logo logoButton tripLogo"
          onClick={() => navigate("/home")}
          aria-label="Go to home"
        >
          voyage<span>.ai</span>
        </button>
        <p>Loading trip…</p>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="tripOverview tripOverviewLoading">
        <button
          type="button"
          className="logo logoButton tripLogo"
          onClick={() => navigate("/home")}
          aria-label="Go to home"
        >
          voyage<span>.ai</span>
        </button>
        <p style={{ color: "#b00020", marginTop: 24 }}>{error}</p>
        <button onClick={() => navigate("/home")} style={{ marginTop: 16 }}>
          Back to home
        </button>
      </div>
    );
  }

  if (!trip) return null;

  const syncedLabel = formatSyncDate(lastSynced);

  return (
    <div className="tripOverview">
      {/* ── Dark Hero ── */}
      <header className="tripHero">
        <div className="tripHeroTop">
          <button
            type="button"
            className="logo logoButton tripLogo"
            onClick={() => navigate("/home")}
            aria-label="Go to home"
          >
            voyage<span>.ai</span>
          </button>
          <div className="tripHeroActions">
            <span
              className={`offlinePill ${isOnline ? "" : "is-offline"}`}
              role="status"
              aria-live="polite"
            >
              {isOnline ? <Icon.check /> : <span className="pulseDot" aria-hidden="true"></span>}
              {isOnline
                ? syncedLabel
                  ? `Synced ${syncedLabel}`
                  : "Available Offline"
                : "Offline mode"}
            </span>
            <button className="heroBtn heroBtnGhost" onClick={copyLink} aria-label="Copy share link">
              <Icon.link />
              Copy Link
            </button>
            <button
              className="heroBtn heroBtnSolid"
              onClick={duplicateTrip}
              disabled={duplicating}
              aria-label="Duplicate trip"
            >
              <Icon.copy />
              {duplicating ? "Duplicating…" : "Duplicate Trip"}
            </button>
          </div>
        </div>

        <div className="tripHeroBody">
          <div className="tripHeroLeft">
            <span className="sharedPill">Shared by {trip.sharedBy}</span>
            <h1 className="tripTitle">{trip.title}</h1>
            <p className="tripMetaLine">
              {trip.dateRange} · {trip.travelers} travelers · {trip.vibe}
            </p>
          </div>
          <div className="tripHeroStats" aria-label="Trip totals">
            <div className="heroStatBox">
              <div className="heroStatValue">{trip.totals.days}</div>
              <div className="heroStatLabel">Days</div>
            </div>
            <div className="heroStatBox">
              <div className="heroStatValue">{trip.totals.stops}</div>
              <div className="heroStatLabel">Stops</div>
            </div>
            <div className="heroStatBox">
              <div className="heroStatValue">${trip.totals.cost.toLocaleString("en-US")}</div>
              <div className="heroStatLabel">Est. Cost</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats strip ── */}
      <section className="tripStatsStrip" aria-label="Trip highlights">
        <div className="tripStat">
          <span className="tripStatIcon"><Icon.sun /></span>
          <span className="tripStatValue">{trip.stats.weather}</span>
          <span className="tripStatLabel">Weather</span>
        </div>
        <div className="tripStat">
          <span className="tripStatIcon"><Icon.wallet /></span>
          <span className="tripStatValue">${trip.stats.dailyCost}/day</span>
          <span className="tripStatLabel">Avg Daily Cost</span>
        </div>
        <div className="tripStat">
          <span className="tripStatIcon"><Icon.walk /></span>
          <span className="tripStatValue">{trip.stats.walking} km</span>
          <span className="tripStatLabel">Total Walking</span>
        </div>
        <div className="tripStat">
          <span className="tripStatIcon"><Icon.fork /></span>
          <span className="tripStatValue">{trip.stats.restaurants}</span>
          <span className="tripStatLabel">Restaurants</span>
        </div>
      </section>

      {/* ── Day tabs ── */}
      {days.length > 0 && (
        <nav className="dayTabs" aria-label="Trip days">
          <div className="dayTabsScroll">
            {days.map((d) => (
              <button
                key={d.day}
                className={`dayPill ${activeDay === d.day ? "active" : ""}`}
                onClick={() => setActiveDay(d.day)}
                aria-pressed={activeDay === d.day}
              >
                Day {d.day}{d.date ? ` · ${dayPillLabel(d.date)}` : ""}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ── Day timeline ── */}
      <main className="dayItinerary">
        {activeDayData && (
          <>
            <header className="dayHeader">
              <span className="dayBadge" aria-hidden="true">{activeDayData.day}</span>
              <div className="dayHeaderText">
                <h2 className="dayTheme">{activeDayData.theme || `Day ${activeDayData.day}`}</h2>
                <p className="dayMeta">
                  {activeDayData.date}
                  {activeDayData.date && activeStops.length > 0 ? " · " : ""}
                  {activeStops.length > 0 ? `${activeStops.length} stops` : ""}
                </p>
              </div>
            </header>

            {activeStops.length > 0 ? (
              <ol className="timeline">
                {activeStops.map((stop, i) => {
                  const desc = stop.desc || stop.description;
                  return (
                    <li key={i} className="timelineItem">
                      <article className="stopCard">
                        <div className="stopCardTop">
                          <h3 className="stopTitle">{stop.title || "Untitled stop"}</h3>
                          {stop.time && <span className="stopTime">{stop.time}</span>}
                        </div>
                        {stop.type && <p className="stopType">{stop.type}</p>}
                        {desc && <p className="stopDesc">{desc}</p>}
                        {(stop.duration || stop.cost) && (
                          <div className="stopTags">
                            {stop.duration && <span className="stopTag">{stop.duration}</span>}
                            {stop.cost && <span className="stopTag">{stop.cost}</span>}
                          </div>
                        )}
                      </article>
                      {stop.transitAfter && i < activeStops.length - 1 && (
                        <div className="transitRow" aria-label="Transit">{stop.transitAfter}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="emptyDay">No stops planned yet for this day.</p>
            )}
          </>
        )}
      </main>

      {/* ── Sync bar ── */}
      <div className="syncBar" role="status">
        <div className="syncBarLeft">
          {isOnline ? (
            <>
              <span className="syncIcon syncIconOk"><Icon.check /></span>
              <span className="syncText">
                Up to date{syncedLabel ? ` · Last synced: ${syncedLabel}` : ""}
              </span>
            </>
          ) : (
            <>
              <span className="syncIcon syncIconOff"><Icon.cloudOff /></span>
              <span className="syncText">
                You're viewing this trip offline.
                {syncedLabel ? ` Last synced: ${syncedLabel}` : ""}
              </span>
            </>
          )}
        </div>
        <button
          className="syncBtn"
          onClick={syncNow}
          disabled={!isOnline || syncing}
          aria-label="Sync trip"
        >
          {syncing ? "Syncing…" : "Sync when online"}
        </button>
      </div>

      {/* ── Toast ── */}
      {ToastNode}
    </div>
  );
}
