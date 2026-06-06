import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icons";
import { useToast } from "../components/Toast";
import SearchField, { fmtDateRange, fmtBudget, shiftMonth, addDays, isoFromDate, MonthView } from "../components/SearchField";
import { api, auth } from "../utils/api";

const TRIP_COLORS = ["#e57373", "#5b8def", "#b178d4", "#4caf7a", "#f0a020"];
const colorForTrip = (id) => {
  const s = String(id || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TRIP_COLORS[h % TRIP_COLORS.length];
};

// ───── Homepage data ─────
const HOME_IMG = {
  tokyo: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1400&q=80&auto=format&fit=crop",
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80&auto=format&fit=crop",
  seoul: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&q=80&auto=format&fit=crop",
};

const SUGGESTIONS = [
  { name: "Tokyo, Japan", desc: "Vibrant city, endless food scene", color: "#e57373", letter: "T" },
  { name: "Paris, France", desc: "Art, culture & romance", color: "#5b8def", letter: "P" },
  { name: "Seoul, Korea", desc: "K-culture & street food capital", color: "#b178d4", letter: "S" },
  { name: "Bali, Indonesia", desc: "Tropical paradise & temples", color: "#4caf7a", letter: "B" },
  { name: "New York, USA", desc: "The city that never sleeps", color: "#f0a020", letter: "N" },
];
const BUDGET_PILLS = [500, 1000, 2000, 3000, 5000];

export default function HomePage() {
  const navigate = useNavigate();
  const { showToast, ToastNode } = useToast();
  const user = auth.getUser();
  const greetName = user?.name?.split(" ")[0] || "traveler";
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState("");
  const [where, setWhere] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [budget, setBudget] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const searchBarRef = useRef(null);
  const whereInputRef = useRef(null);
  const budgetInputRef = useRef(null);
  const highlightRef = useRef(null);
  const fieldRefs = {
    where: useRef(null),
    when: useRef(null),
    who: useRef(null),
    wallet: useRef(null),
  };

  // Slide the white pill highlight to the active field
  useLayoutEffect(() => {
    const hi = highlightRef.current;
    const bar = searchBarRef.current;
    if (!hi || !bar) return;
    if (!activeField) { hi.classList.remove("is-active"); return; }
    const target = fieldRefs[activeField]?.current;
    if (!target) return;
    const barRect = bar.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const x = tRect.left - barRect.left;
    hi.style.width = tRect.width + "px";
    hi.style.setProperty("--hi-x", x + "px");
    hi.classList.add("is-active");
  }, [activeField]);

  // Reposition highlight on resize
  useEffect(() => {
    const onResize = () => {
      if (!activeField) return;
      const hi = highlightRef.current;
      const bar = searchBarRef.current;
      const target = fieldRefs[activeField]?.current;
      if (!hi || !bar || !target) return;
      const barRect = bar.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      hi.style.width = tRect.width + "px";
      hi.style.setProperty("--hi-x", (tRect.left - barRect.left) + "px");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeField]);

  // Click-outside / Esc to close hamburger menu
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  // Click-outside / Esc to close search popovers
  useEffect(() => {
    if (!activeField) return;
    const onDoc = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) setActiveField(null);
    };
    const onKey = (e) => { if (e.key === "Escape") setActiveField(null); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [activeField]);

  // Auto-focus inputs
  useEffect(() => {
    if (activeField === "where") whereInputRef.current?.focus();
    if (activeField === "wallet") budgetInputRef.current?.focus();
  }, [activeField]);

  // Fetch trips on mount (redirect to signin if not authed)
  useEffect(() => {
    if (!auth.isAuthed()) {
      navigate("/signin");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setTripsLoading(true);
        setTripsError("");
        const data = await api.listTrips();
        if (!cancelled) setTrips(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) { navigate("/signin"); return; }
        setTripsError(err.message || "Could not load trips");
      } finally {
        if (!cancelled) setTripsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleLogout = () => {
    auth.logout();
    navigate("/signin");
  };

  const totalGuests = adults + children;
  const whoLabel = totalGuests > 0 ? `${totalGuests} guest${totalGuests === 1 ? "" : "s"}` : "";

  const handleDayPick = (iso) => {
    if (!dateStart || (dateStart && dateEnd)) { setDateStart(iso); setDateEnd(""); }
    else if (iso < dateStart) { setDateStart(iso); setDateEnd(""); }
    else { setDateEnd(iso); }
  };

  const applyQuickRange = (kind) => {
    const start = new Date();
    if (kind === "weekend") {
      const day = start.getDay();
      const daysToFri = (5 - day + 7) % 7 || 7;
      const fri = addDays(start, daysToFri);
      const sun = addDays(fri, 2);
      setDateStart(isoFromDate(fri)); setDateEnd(isoFromDate(sun));
      setViewMonth(new Date(fri.getFullYear(), fri.getMonth(), 1));
    } else if (kind === "week") {
      setDateStart(isoFromDate(start)); setDateEnd(isoFromDate(addDays(start, 6)));
      setViewMonth(new Date(start.getFullYear(), start.getMonth(), 1));
    } else if (kind === "twoweeks") {
      setDateStart(isoFromDate(start)); setDateEnd(isoFromDate(addDays(start, 13)));
      setViewMonth(new Date(start.getFullYear(), start.getMonth(), 1));
    }
  };
  const handlePlanWithAI = () => {
    setActiveField(null);

    navigate("/plan", {
      state: {
        where,
        dateStart,
        dateEnd,
        adults,
        children,
        budget,
        dateLabel: fmtDateRange(dateStart, dateEnd),
        budgetLabel: fmtBudget(budget),
        whoLabel,
      },
    });
  };
  
  return (
    <div className="app">
      <nav className="navbar">
        <button
          type="button"
          className="logo logoButton"
          onClick={() => navigate("/home")}
          aria-label="Go to home"
        >
          voyage<span>.ai</span>
        </button>
        <div className="navLinks">
          <button className="iconButton" aria-label="notifications">
            <Icon.bell />
            <span className="bellDot"></span>
          </button>
          <div className="avatar" aria-label="user profile">Y</div>
          <div className="menuWrap" ref={menuRef}>
            <button
              className={`menuBtn ${menuOpen ? "is-open" : ""}`}
              aria-label="open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Icon.hamburger />
            </button>
            {menuOpen && (
              <div className="avatarMenu" role="menu">
                <button
                  role="menuitem"
                  className="menuItem"
                  onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                >
                  <span className="menuIcon"><Icon.person /></span>Profile
                </button>
                <button
                  role="menuitem"
                  className="menuItem"
                  onClick={() => {
                    setMenuOpen(false);
                    const el = document.getElementById("my-trips");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className="menuIcon"><Icon.suitcase /></span>My Trips
                </button>
                <button
                  role="menuitem"
                  className="menuItem"
                  onClick={() => { setMenuOpen(false); navigate("/profile?tab=saved"); }}
                >
                  <span className="menuIcon"><Icon.heart /></span>Saved Places
                </button>
                <button
                  role="menuitem"
                  className="menuItem"
                  onClick={() => { setMenuOpen(false); showToast("Account settings — coming soon"); }}
                >
                  <span className="menuIcon"><Icon.gear /></span>Account settings
                </button>
                <button
                  role="menuitem"
                  className="menuItem"
                  onClick={() => { setMenuOpen(false); showToast("Help Center — coming soon"); }}
                >
                  <span className="menuIcon"><Icon.help /></span>Help Center
                </button>
                <button
                  role="menuitem"
                  className="menuItem"
                  onClick={() => { setMenuOpen(false); navigate("/about"); }}
                >
                  <span className="menuIcon"><Icon.info /></span>About
                </button>
                <div className="menuDivider"></div>
                <button
                  role="menuitem"
                  className="menuItem"
                  onClick={handleLogout}
                >
                  <span className="menuIcon"><Icon.logout /></span>Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="dashboard">
        <section className="greeting">
          <h1>Welcome back, {greetName}</h1>
          <div className="stats">
            <strong>3</strong> trips
            <span className="dot"></span>
            <strong>2</strong> countries
            <span className="dot"></span>
            <strong>12</strong> days
            <span className="dot"></span>
            <strong>$3,000</strong> budget
          </div>
        </section>

        <section className="searchBar" aria-label="Plan a new trip" ref={searchBarRef}>
          <div className="searchHighlight" ref={highlightRef} aria-hidden="true"></div>

          <SearchField ref={fieldRefs.where} label="Where" value={where} placeholder="Search destinations" isOpen={activeField === "where"} onOpen={() => setActiveField("where")} popoverClass="where">
            <input ref={whereInputRef} className="popInput" type="text" placeholder="Search destinations" value={where} onChange={(e) => setWhere(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setActiveField(null); }} />
            <div className="suggHeader">Suggested destinations</div>
            <div className="suggList">
              {SUGGESTIONS.map((s) => (
                <button key={s.name} type="button" className="suggItem" onClick={() => { setWhere(s.name); setActiveField(null); }}>
                  <span className="suggIcon" style={{ background: s.color }}>{s.letter}</span>
                  <span className="suggBody">
                    <span className="name">{s.name}</span>
                    <span className="desc">{s.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </SearchField>

          <SearchField ref={fieldRefs.when} label="When" value={fmtDateRange(dateStart, dateEnd)} placeholder="Add dates" isOpen={activeField === "when"} onOpen={() => setActiveField("when")} popoverClass="when">
            <div className="calNav">
              <button type="button" className="calNavBtn" aria-label="Previous month" onClick={() => setViewMonth((m) => shiftMonth(m, -1))}><Icon.chevL /></button>
              <button type="button" className="calNavBtn" aria-label="Next month" onClick={() => setViewMonth((m) => shiftMonth(m, 1))}><Icon.chevR /></button>
            </div>
            <div className="calMonths">
              <MonthView monthDate={viewMonth} start={dateStart} end={dateEnd} onPick={handleDayPick} />
              <MonthView monthDate={shiftMonth(viewMonth, 1)} start={dateStart} end={dateEnd} onPick={handleDayPick} />
            </div>
            <div className="quickPills">
              <button type="button" className="pill" onClick={() => applyQuickRange("weekend")}>Weekend</button>
              <button type="button" className="pill" onClick={() => applyQuickRange("week")}>1 week</button>
              <button type="button" className="pill" onClick={() => applyQuickRange("twoweeks")}>2 weeks</button>
            </div>
          </SearchField>

          <SearchField ref={fieldRefs.who} label="Who" value={whoLabel} placeholder="Add travelers" isOpen={activeField === "who"} onOpen={() => setActiveField("who")} popoverClass="who">
            <div className="whoRow">
              <div className="whoInfo"><div className="title">Adults</div><div className="sub">Ages 13 or above</div></div>
              <div className="stepperControls">
                <button type="button" className="stepBtn" disabled={adults <= 1} onClick={() => setAdults((n) => Math.max(1, n - 1))}>&minus;</button>
                <span className="stepCount">{adults}</span>
                <button type="button" className="stepBtn" disabled={adults >= 16} onClick={() => setAdults((n) => Math.min(16, n + 1))}>+</button>
              </div>
            </div>
            <div className="whoRow">
              <div className="whoInfo"><div className="title">Children</div><div className="sub">Ages 2&ndash;12</div></div>
              <div className="stepperControls">
                <button type="button" className="stepBtn" disabled={children <= 0} onClick={() => setChildren((n) => Math.max(0, n - 1))}>&minus;</button>
                <span className="stepCount">{children}</span>
                <button type="button" className="stepBtn" disabled={children >= 10} onClick={() => setChildren((n) => Math.min(10, n + 1))}>+</button>
              </div>
            </div>
          </SearchField>

          <SearchField ref={fieldRefs.wallet} label="Wallet" value={fmtBudget(budget)} placeholder="Set budget" isOpen={activeField === "wallet"} onOpen={() => setActiveField("wallet")} popoverClass="right wallet">
            <label className="popLabel" htmlFor="f-budget">Total budget</label>
            <div className="budgetWrap">
              <span className="currency">$</span>
              <input id="f-budget" ref={budgetInputRef} className="popInput" type="number" inputMode="numeric" min="0" step="50" placeholder="Enter your budget" value={budget} onChange={(e) => setBudget(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setActiveField(null); }} />
            </div>
            <div className="budgetPills">
              {BUDGET_PILLS.map((amt) => (
                <button key={amt} type="button" className={`pill ${Number(budget) === amt ? "active" : ""}`} onClick={() => setBudget(String(amt))}>
                  ${amt.toLocaleString("en-US")}
                </button>
              ))}
            </div>
          </SearchField>

          <button className="planButton" onClick={handlePlanWithAI}>
            <Icon.sparkle />
            Plan with AI
          </button>
        </section>

        <section className="sectionBlock">
          <div className="sectionHeader"><h2>Coming up</h2></div>
          <article className="comingCard">
            <div className="comingImage">
              <img src={HOME_IMG.tokyo} alt="Tokyo cityscape" />
            </div>
            <div className="comingInfo">
              <p className="label">Next trip</p>
              <h3>Tokyo, Japan</h3>
              <p className="country">Honsh&#363; &middot; Capital region</p>
              <div className="tripMeta">
                <div><Icon.calendar /> <span><strong>May 20</strong> &ndash; May 25</span></div>
                <div><Icon.users /> <span><strong>2</strong> travelers</span></div>
                <div><Icon.wallet /> <span><strong>$1,500</strong> budget</span></div>
              </div>
              <button className="ctaLink" onClick={() => navigate("/trip/tokyo-adventure")}>View itinerary <Icon.arrowRight /></button>
            </div>
          </article>
        </section>

        <section className="sectionBlock" id="my-trips" style={{ scrollMarginTop: 88 }}>
          <div className="sectionHeader">
            <h2>My trips</h2>
            <a className="more">View all</a>
          </div>
          {tripsLoading ? (
            <p className="meta" style={{ padding: "16px 0" }}>Loading your trips…</p>
          ) : tripsError ? (
            <p role="alert" style={{ color: "#b00020", padding: "16px 0" }}>{tripsError}</p>
          ) : (
            <div className="tripGrid">
              {trips.map((t) => {
                const dayCount = Array.isArray(t.days) ? t.days.length : 0;
                const letter = (t.where || t.title || "?").trim().charAt(0).toUpperCase();
                return (
                  <article
                    key={t._id}
                    className="tripCard"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/trip/${t._id}`)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/trip/${t._id}`); } }}
                  >
                    <div className="cardImage" style={{ background: colorForTrip(t._id), display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="tag">Upcoming</span>
                      <span style={{ color: "white", fontSize: 64, fontWeight: 600 }}>{letter}</span>
                    </div>
                    <div className="tripCardBody">
                      <h3>{t.title || "Untitled trip"}</h3>
                      <p className="meta">
                        {t.where || "—"}{dayCount > 0 && ` · ${dayCount} day${dayCount === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  </article>
                );
              })}
              <article className="newTripCard" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <div className="newTripImage">
                  <div className="plusCircle"><Icon.plus /></div>
                </div>
                <div className="tripCardBody">
                  <h3>Start a new trip</h3>
                  <p className="meta">Let AI plan your next adventure</p>
                </div>
              </article>
            </div>
          )}
        </section>
      </main>
      {ToastNode}
    </div>
  );
}
