import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icons";
import { useToast } from "../components/Toast";
import "../styles/tripOverview.css";

const SAMPLE_TRIP = {
  id: "tokyo-adventure",
  title: "Tokyo Adventure",
  dateRange: "Jul 12 – 19, 2026",
  travelers: 2,
  vibe: "Cultural & Relaxing",
  sharedBy: "Yoyo",
  totals: { days: 7, stops: 28, cost: 1920 },
  stats: { weather: "28°C avg", dailyCost: 274, walking: 42, restaurants: 14 },
  days: [
    {
      day: 1,
      theme: "Arrival & Shibuya",
      date: "Saturday, Jul 12",
      stops: [
        { time: "9:00 AM", title: "Meiji Jingu Shrine", type: "Temple · Shibuya", desc: "Peaceful Shinto shrine surrounded by forest in the heart of Tokyo.", duration: "2 hrs", cost: "Free", transitAfter: "🚶 15 min walk" },
        { time: "11:30 AM", title: "Takeshita Street", type: "Shopping · Harajuku", desc: "Iconic pedestrian street packed with kawaii fashion and street food.", duration: "1.5 hrs", cost: "Free", transitAfter: "🚆 5 min train" },
        { time: "1:30 PM", title: "Ichiran Ramen Shibuya", type: "Restaurant · Shibuya", desc: "Solo-booth ramen experience — a must-try in Tokyo.", duration: "1 hr", cost: "~$12", transitAfter: "🚶 8 min walk" },
        { time: "3:00 PM", title: "Shibuya Crossing & Sky", type: "Landmark · Shibuya", desc: "World-famous crossing, then sunset views from Shibuya Sky observatory.", duration: "2 hrs", cost: "~$18", transitAfter: null },
      ],
    },
    {
      day: 2,
      theme: "Asakusa & Akihabara",
      date: "Sunday, Jul 13",
      stops: [
        { time: "9:30 AM", title: "Senso-ji Temple", type: "Temple · Asakusa", desc: "Tokyo's oldest temple, with the iconic Kaminarimon gate.", duration: "1.5 hrs", cost: "Free", transitAfter: "🚶 10 min walk" },
        { time: "11:30 AM", title: "Nakamise Shopping Street", type: "Shopping · Asakusa", desc: "Traditional snacks and souvenirs leading up to the temple.", duration: "1 hr", cost: "~$20", transitAfter: "🚆 25 min train" },
        { time: "2:00 PM", title: "Akihabara Electric Town", type: "District · Akihabara", desc: "Anime, gaming, and electronics paradise.", duration: "3 hrs", cost: "~$40", transitAfter: null },
      ],
    },
    {
      day: 3,
      theme: "Tsukiji & Ginza",
      date: "Monday, Jul 14",
      stops: [
        { time: "7:30 AM", title: "Tsukiji Outer Market", type: "Market · Tsukiji", desc: "Fresh sushi breakfast and live food stalls.", duration: "2 hrs", cost: "~$25", transitAfter: "🚆 10 min train" },
        { time: "11:00 AM", title: "Hamarikyu Gardens", type: "Garden · Chuo", desc: "Edo-period garden with tea house on the bay.", duration: "1.5 hrs", cost: "~$3", transitAfter: "🚶 12 min walk" },
        { time: "1:30 PM", title: "Ginza Shopping District", type: "Shopping · Ginza", desc: "Luxury boutiques and the iconic Wako clock tower.", duration: "3 hrs", cost: "~$50", transitAfter: null },
      ],
    },
  ],
};

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
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [lastSynced, setLastSynced] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const { showToast, ToastNode } = useToast();

  useEffect(() => {
    const cacheKey = `voyage_trip_${id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setTrip(parsed.data);
        setLastSynced(parsed.syncedAt);
      } catch (e) {
        // corrupt cache — ignore and fall through to fetch
      }
    }
    if (navigator.onLine) {
      const t = setTimeout(() => {
        const data = { ...SAMPLE_TRIP, id };
        const syncedAt = new Date().toISOString();
        setTrip(data);
        setLastSynced(syncedAt);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data, syncedAt }));
        } catch (e) {
          // storage full — silently degrade
        }
      }, 250);
      return () => clearTimeout(t);
    }
  }, [id]);

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

  const duplicateTrip = () => {
    showToast("Trip duplicated to your account!");
  };

  const syncNow = () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    setTimeout(() => {
      const cacheKey = `voyage_trip_${id}`;
      const data = trip ?? { ...SAMPLE_TRIP, id };
      const syncedAt = new Date().toISOString();
      setTrip(data);
      setLastSynced(syncedAt);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ data, syncedAt }));
      } catch (e) { /* noop */ }
      setSyncing(false);
      showToast("Trip synced");
    }, 600);
  };

  const days = Array.isArray(trip?.days) ? trip.days : [];

  const activeDayData = useMemo(() => {
    if (days.length === 0) return null;
    return days.find((d) => d.day === activeDay) ?? days[0];
  }, [days, activeDay]);

  const activeStops = Array.isArray(activeDayData?.stops) ? activeDayData.stops : [];

  if (!trip) {
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
            <button className="heroBtn heroBtnSolid" onClick={duplicateTrip} aria-label="Duplicate trip">
              <Icon.copy />
              Duplicate Trip
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
