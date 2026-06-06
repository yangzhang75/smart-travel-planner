import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Icon,
  MapPin, Briefcase, GradCap, GlobeIcon, Compass, MusicIcon, Bolt, HeartIcon,
  UserNav, SuitcaseNav, TagNav, ArrowLeft,
} from "../components/Icons";
import { useToast } from "../components/Toast";
import { auth } from "../utils/api";
import "../styles/profile.css";

const initialsFromName = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

// ───── Profile data ─────
const PROFILE_FIELDS = [
  { key: "live", IconComp: MapPin, name: "Where I live" },
  { key: "work", IconComp: Briefcase, name: "My work" },
  { key: "school", IconComp: GradCap, name: "Where I went to school" },
  { key: "lang", IconComp: GlobeIcon, name: "Languages I speak" },
  { key: "dream", IconComp: Compass, name: "Dream destination" },
  { key: "song", IconComp: MusicIcon, name: "Favorite travel song" },
  { key: "fact", IconComp: Bolt, name: "My fun fact" },
  { key: "obsessed", IconComp: HeartIcon, name: "I'm obsessed with" },
];

const STAMPS = [
  { shape: "circle", label: "Tokyo, Japan", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=240&q=80&auto=format&fit=crop" },
  { shape: "rect", label: "New York, USA", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=240&q=80&auto=format&fit=crop" },
  { shape: "diamond", label: "Paris, France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=240&q=80&auto=format&fit=crop" },
  { shape: "hex", label: "Bali, Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=240&q=80&auto=format&fit=crop" },
];

const PAST_TRIPS = [
  { id: "rome-italy", name: "Rome, Italy", meta: "Jan 2026 · 7 days", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=320&q=80&auto=format&fit=crop" },
  { id: "barcelona-spain", name: "Barcelona, Spain", meta: "Oct 2025 · 5 days", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=320&q=80&auto=format&fit=crop" },
  { id: "tokyo-japan", name: "Tokyo, Japan", meta: "Apr 2025 · 10 days", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=320&q=80&auto=format&fit=crop" },
];

const INTERESTS = [
  "Food & Dining", "Photography", "Hiking", "Art & Museums",
  "Nightlife", "Shopping", "History & Culture", "Beach & Water",
  "Adventure", "Nature", "Architecture", "Local Markets",
];

const TRAVEL_STATS = [
  { key: "countries", icon: <GlobeIcon />, label: "Countries", value: 12 },
  { key: "cities", icon: <MapPin />, label: "Cities", value: 28 },
  { key: "trips", icon: <SuitcaseNav />, label: "Total trips", value: 15 },
  { key: "days", icon: <Icon.calendar />, label: "Days traveled", value: 124 },
];

const FAVORITE_PLACES = [
  { id: "santorini", name: "Santorini", country: "🇬🇷 Greece", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80&auto=format&fit=crop" },
  { id: "kyoto", name: "Kyoto", country: "🇯🇵 Japan", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80&auto=format&fit=crop" },
  { id: "iceland", name: "Iceland", country: "🇮🇸 Iceland", img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80&auto=format&fit=crop" },
  { id: "bali", name: "Bali", country: "🇮🇩 Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80&auto=format&fit=crop" },
];

const ADVENTURE_LEVELS = ["Low", "Medium", "High"];
const BUDGET_STYLES = ["Budget", "Mid-range", "Luxury"];
const ACCOMMODATIONS = ["Hotel", "Hostel", "Airbnb", "Camping"];
const FOOD_PREFS = ["Any", "Vegetarian", "Vegan", "Halal", "Kosher"];

const NAV_ITEMS = [
  { key: "about", label: "About me", IconComp: UserNav },
  { key: "past", label: "Past trips", IconComp: SuitcaseNav },
  { key: "saved", label: "Saved Places", IconComp: HeartIcon },
  { key: "interests", label: "Travel interests", IconComp: TagNav },
  { key: "preferences", label: "Travel preferences", IconComp: Compass },
];

const VALID_TABS = NAV_ITEMS.map((n) => n.key);

const STORAGE_KEY = "voyage_profile";

const slugify = (s = "") =>
  s.toLowerCase()
    .replace(/[,]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const emptyFields = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.key, ""]));

// ───── Reusable favorite card (shared by hero + Saved Places panel) ─────
function FavoriteCard({ place, isFav, popping, onCardClick, onToggle }) {
  return (
    <article
      className="favCard"
      role="button"
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick();
        }
      }}
      aria-label={`${place.name}, ${place.country}`}
    >
      <div className="favCardImageWrap">
        <img src={place.img} alt={place.name} loading="lazy" />
        <button
          type="button"
          className={`favHeartBtn ${isFav ? "filled" : ""} ${popping ? "popping" : ""}`}
          aria-label={isFav ? `Remove ${place.name} from favorites` : `Add ${place.name} to favorites`}
          aria-pressed={isFav}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20.8 6.6a5.5 5.5 0 0 0-9-1.7l-.3.3-.3-.3a5.5 5.5 0 1 0-7.8 7.8l8.1 8.1 8.1-8.1a5.5 5.5 0 0 0 1.2-6.1z"
              fill={isFav ? "#e53e3e" : "none"}
              stroke={isFav ? "none" : "var(--ink-soft)"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="favCardBody">
        <h3 className="favCardName">{place.name}</h3>
        <p className="favCardCountry">{place.country}</p>
      </div>
    </article>
  );
}

// ───── ProfileField (module scope — stable identity across renders) ─────
function ProfileField({ IconComp, name, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const filled = value && value.trim().length > 0;

  if (editing) {
    return (
      <div className={`profField ${filled ? "filled" : ""}`}>
        <span className="profFieldIcon"><IconComp /></span>
        <input
          autoFocus
          placeholder={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }}
        />
      </div>
    );
  }
  return (
    <div className={`profField ${filled ? "filled" : ""}`} onClick={() => setEditing(true)}>
      <span className="profFieldIcon"><IconComp /></span>
      {filled ? (
        <div className="profFieldBody">
          <div className="profFieldLabel">{name}</div>
          <div className="profFieldValue">{value}</div>
        </div>
      ) : (
        <span className="profFieldName">{name}</span>
      )}
    </div>
  );
}

// ───── Profile Page ─────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast, ToastNode } = useToast();

  const user = auth.getUser();
  const displayName = user?.name?.trim() || "Traveler";
  const displayEmail = user?.email || "—";
  const displayInitials = initialsFromName(user?.name);

  useEffect(() => {
    if (!auth.isAuthed()) navigate("/signin");
  }, [navigate]);

  // Lazy initializers — read localStorage once on mount.
  const [about, setAbout] = useState(() => loadProfile().about ?? "");
  const [aboutEditing, setAboutEditing] = useState(false);
  const [fields, setFields] = useState(() => ({ ...emptyFields, ...(loadProfile().fields || {}) }));
  const [showStamps, setShowStamps] = useState(() => loadProfile().showStamps ?? true);
  const [interests, setInterests] = useState(() => {
    const saved = loadProfile().interests;
    return new Set(Array.isArray(saved) ? saved : ["Food & Dining", "Photography"]);
  });
  const [nav, setNav] = useState(() => {
    const t = searchParams.get("tab");
    return t && VALID_TABS.includes(t) ? t : "about";
  });
  const [editing, setEditing] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    const saved = loadProfile().favorites;
    return new Set(Array.isArray(saved) ? saved : FAVORITE_PLACES.map((p) => p.id));
  });
  const [poppingHeart, setPoppingHeart] = useState(null);
  const [adventure, setAdventure] = useState(() => loadProfile().adventure ?? "Medium");
  const [budgetStyle, setBudgetStyle] = useState(() => loadProfile().budgetStyle ?? "Mid-range");
  const [accommodation, setAccommodation] = useState(() => {
    const saved = loadProfile().accommodation;
    return new Set(Array.isArray(saved) ? saved : ["Hotel", "Airbnb"]);
  });
  const [food, setFood] = useState(() => {
    const saved = loadProfile().food;
    return new Set(Array.isArray(saved) ? saved : ["Any"]);
  });

  // Sync nav to URL ?tab= changes
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && VALID_TABS.includes(t) && t !== nav) {
      setNav(t);
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Persist on any change
  useEffect(() => {
    try {
      const blob = {
        about,
        fields,
        showStamps,
        interests: [...interests],
        favorites: [...favorites],
        adventure,
        budgetStyle,
        accommodation: [...accommodation],
        food: [...food],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
    } catch { /* quota / private mode — silently degrade */ }
  }, [about, fields, showStamps, interests, favorites, adventure, budgetStyle, accommodation, food]);

  const setField = (key, val) => setFields((prev) => ({ ...prev, [key]: val }));

  const toggleInterest = (tag) => setInterests((prev) => {
    const next = new Set(prev);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    return next;
  });

  const toggleFavorite = (id, name) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast(`Removed ${name} from favorites`);
      } else {
        next.add(id);
        showToast(`Added ${name} to favorites`);
      }
      return next;
    });
    setPoppingHeart(id);
    setTimeout(() => setPoppingHeart(null), 260);
  };

  const toggleSetMember = (setter, val) => {
    setter((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  };

  const goEdit = () => { setNav("about"); setEditing(true); };
  const goAddIntro = () => { setNav("about"); setEditing(true); setAboutEditing(true); };
  const handleDone = () => {
    setEditing(false);
    setAboutEditing(false);
    showToast("Profile updated");
  };

  // Derived values for About read view
  const filledFields = PROFILE_FIELDS.filter((f) => fields[f.key] && fields[f.key].trim().length > 0);
  const prefSummary = [
    adventure && { label: "Adventure", value: adventure },
    budgetStyle && { label: "Budget", value: budgetStyle },
    accommodation.size > 0 && { label: "Stay", value: [...accommodation].join(" · ") },
    food.size > 0 && { label: "Food", value: [...food].join(" · ") },
  ].filter(Boolean);

  const savedPlaces = FAVORITE_PLACES.filter((p) => favorites.has(p.id));

  return (
    <div className="app profilePage">
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
          <button className="profIconBtn" aria-label="Back to home" onClick={() => navigate("/home")}><ArrowLeft /></button>
          <button className="profIconBtn" aria-label="Notifications"><Icon.bell /></button>
          <div className="profNavAvatar">YL</div>
        </div>
      </nav>

      <main className="profilePageMain">
        {/* Hero */}
        <section className="profileHero">
          <div className="profHeroLeft">
            <div className="profHeroAvatar" aria-hidden="true">YL</div>
            <button
              type="button"
              className="profHeroPhotoBtn"
              onClick={() => showToast("Coming soon: change photo")}
            >
              Change photo
            </button>
          </div>
          <div className="profHeroCenter">
            <h1 className="profHeroName">{displayName}</h1>
            <p className="profHeroTagline">Passionate traveler exploring the world</p>
            <div className="profHeroMeta">
              <span><span aria-hidden="true">📧</span> {displayEmail}</span>
              <span><span aria-hidden="true">📍</span> Toronto, Canada</span>
              <span><span aria-hidden="true">🗓️</span> Voyager since 2026</span>
            </div>
          </div>
          <div className="profHeroRight">
            <button
              type="button"
              className="profEditBtn"
              onClick={goEdit}
              aria-label="Edit profile"
            >
              Edit profile
            </button>
          </div>
        </section>

        {/* Stats strip */}
        <section className="profStatsStrip" aria-label="Travel stats">
          {TRAVEL_STATS.map((s) => (
            <div className="profStatCell" key={s.key}>
              <div className="profStatIcon" aria-hidden="true">{s.icon}</div>
              <div className="profStatValue">{s.value}</div>
              <div className="profStatLabel">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Favorite places (hero — wider grid) */}
        <section className="favPlaces" aria-labelledby="favPlacesTitle">
          <div className="favPlacesHead">
            <h2 id="favPlacesTitle" className="favPlacesTitle">Favorite places</h2>
            <p className="favPlacesSub">Tap a heart to save or remove.</p>
          </div>
          <div className="favPlacesGrid">
            {FAVORITE_PLACES.map((p) => (
              <FavoriteCard
                key={p.id}
                place={p}
                isFav={favorites.has(p.id)}
                popping={poppingHeart === p.id}
                onCardClick={() => showToast("Coming soon: place details")}
                onToggle={() => toggleFavorite(p.id, p.name)}
              />
            ))}
          </div>
        </section>

        <div className="profileShell">
          <aside className="profileNav">
            <h1>Profile</h1>
            {NAV_ITEMS.map(({ key, label, IconComp: IC }) => (
              <button
                key={key}
                className={`navItem ${nav === key && !editing ? "active" : ""}`}
                onClick={() => { setNav(key); setEditing(false); }}
              >
                <span className="navIcon"><IC /></span>
                {label}
              </button>
            ))}
          </aside>

          {/* About — read view */}
          {nav === "about" && !editing && (
            <div className="contentPanel">
              <div className="panelHead">
                <h2 className="panelTitle">About me</h2>
              </div>
              <p className="vsSub">Your traveler profile, visible to others.</p>

              {/* Identity card */}
              <section className="identityCard">
                <div className="identityAvatar" aria-hidden="true">{displayInitials}</div>
                <div className="identityBody">
                  <h2 className="identityName">{displayName}</h2>
                  <div className="identityBadges">
                    <span className="idBadge"><span aria-hidden="true">🗓️</span> Voyager since 2026</span>
                    {fields.live && <span className="idBadge"><span aria-hidden="true">📍</span> {fields.live}</span>}
                    {fields.work && <span className="idBadge"><span aria-hidden="true">💼</span> {fields.work}</span>}
                  </div>
                </div>
                <button className="ctaLink identityEditBtn" onClick={() => setEditing(true)}>
                  Edit profile <Icon.arrowRight />
                </button>
              </section>

              {/* About me text */}
              <section className="aboutMeBlock">
                <div className="aboutMeLabel">ABOUT ME</div>
                {about ? (
                  <div className="aboutMeCard">
                    <p className="aboutMeText">{about}</p>
                  </div>
                ) : (
                  <div className="aboutMeEmpty">
                    <p>Add a short intro to introduce yourself.</p>
                    <button className="addCtaBtn" onClick={goAddIntro}>
                      <Icon.plus /> Add intro
                    </button>
                  </div>
                )}
              </section>

              {/* Profile details grid */}
              <section className="detailsBlock">
                <div className="detailsHead">
                  <h3 className="detailsTitle">Profile</h3>
                  {filledFields.length > 0 && (
                    <button className="detailsEditLink" onClick={() => setEditing(true)}>Edit</button>
                  )}
                </div>
                {filledFields.length > 0 ? (
                  <div className="detailsGrid">
                    {filledFields.map((f) => {
                      const IC = f.IconComp;
                      return (
                        <div className="detailRow" key={f.key}>
                          <span className="detailIcon" aria-hidden="true"><IC /></span>
                          <div className="detailBody">
                            <span className="detailLabel">{f.name}</span>
                            <span className="detailValue">{fields[f.key]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="detailsEmpty">
                    <p>Tell other travelers about yourself.</p>
                    <button className="addCtaBtn" onClick={() => setEditing(true)}>
                      <Icon.plus /> Add details
                    </button>
                  </div>
                )}
              </section>

              {/* Stamps */}
              <section className="viewSection">
                <div>
                  <h3 className="vsTitle">Where I&apos;ve been</h3>
                  <p className="vsSub">Stamps from your travels.</p>
                </div>
                <div className="stampsRow">
                  {STAMPS.map((s, i) => (
                    <div key={i} className="stamp">
                      <div className={`stampShape ${s.shape}`} style={{ backgroundImage: `url(${s.img})` }} />
                      <span className="stampLabel">{s.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Travel interests */}
              <section className="viewSection">
                <div>
                  <h3 className="vsTitle">Travel interests</h3>
                  <p className="vsSub">A few things you love.</p>
                </div>
                {interests.size === 0 ? (
                  <div className="emptyTagsRow">
                    <span className="emptyTags">No interests selected yet.</span>
                    <button className="detailsEditLink" onClick={() => setNav("interests")}>Add interests</button>
                  </div>
                ) : (
                  <div className="tagWrap">
                    {[...interests].map((tag) => (
                      <span key={tag} className="tagReadOnly">{tag}</span>
                    ))}
                  </div>
                )}
              </section>

              {/* Travel preferences summary */}
              {prefSummary.length > 0 && (
                <section className="viewSection">
                  <div>
                    <h3 className="vsTitle">Travel preferences</h3>
                    <p className="vsSub">How you like to travel.</p>
                  </div>
                  <div className="prefSummaryRow">
                    {prefSummary.map((p) => (
                      <span className="prefSummaryPill" key={p.label}>
                        <span className="prefSummaryLabel">{p.label}</span>
                        <span className="prefSummaryValue">{p.value}</span>
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* About — edit view */}
          {nav === "about" && editing && (
            <div className="contentPanel editPanel">
              <button className="backLink" onClick={() => setEditing(false)}>&larr; Back to profile</button>
              <div className="panelHead">
                <h2 className="panelTitle">Edit profile</h2>
              </div>
              <p className="vsSub">Fill in details — they save automatically.</p>

              <section className="profSection">
                <div className="profSectionHead">
                  <div>
                    <h2 className="profSectionTitle">About me</h2>
                    <p className="profSectionSub">A short intro that travelers will see on your profile.</p>
                  </div>
                </div>
                {aboutEditing || about ? (
                  <div className="aboutBox filled">
                    <textarea
                      autoFocus={aboutEditing}
                      placeholder="Write something fun and punchy about yourself."
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      onBlur={() => setAboutEditing(false)}
                    />
                  </div>
                ) : (
                  <div className="aboutBox" onClick={() => setAboutEditing(true)}>
                    Write something fun and punchy about yourself.
                  </div>
                )}
                {!about && !aboutEditing && (
                  <button className="linkBtn" onClick={() => setAboutEditing(true)}>Add intro</button>
                )}
              </section>

              <section className="profSection">
                <div className="profSectionHead">
                  <div>
                    <h2 className="profSectionTitle">My profile</h2>
                    <p className="profSectionSub">Share a few details so fellow travelers can get to know you.</p>
                  </div>
                </div>
                <div className="profFieldGrid">
                  {PROFILE_FIELDS.map((f) => (
                    <ProfileField
                      key={f.key}
                      IconComp={f.IconComp}
                      name={f.name}
                      value={fields[f.key]}
                      onChange={(v) => setField(f.key, v)}
                    />
                  ))}
                </div>
              </section>

              <section className="profSection">
                <div className="profSectionHead">
                  <div>
                    <h2 className="profSectionTitle">Where I&apos;ve been</h2>
                    <p className="profSectionSub">Pick the stamps you want others to see.</p>
                  </div>
                  <button
                    className={`toggle ${showStamps ? "on" : ""}`}
                    aria-label="Show stamps on profile"
                    onClick={() => setShowStamps((v) => !v)}
                  />
                </div>
                <div className="stampsRow">
                  {STAMPS.map((s, i) => (
                    <div key={i} className="stamp">
                      <div className={`stampShape ${s.shape}`} style={{ backgroundImage: `url(${s.img})` }} />
                      <span className="stampLabel">{s.label}</span>
                    </div>
                  ))}
                </div>
                <button className="linkBtn">Edit travel stamps</button>
              </section>

              <section className="profSection">
                <div className="profSectionHead">
                  <div>
                    <h2 className="profSectionTitle">Travel interests</h2>
                    <p className="profSectionSub">Find common ground with other travelers.</p>
                  </div>
                </div>
                <div className="profPills">
                  {INTERESTS.map((tag) => (
                    <button
                      key={tag}
                      className={`profPill ${interests.has(tag) ? "on" : ""}`}
                      onClick={() => toggleInterest(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Past trips */}
          {nav === "past" && (
            <div className="contentPanel">
              <div className="panelHead">
                <h2 className="panelTitle">Past trips</h2>
              </div>
              <p className="vsSub">Your completed adventures.</p>
              {PAST_TRIPS.length > 0 ? (
                <div className="tripList">
                  {PAST_TRIPS.map((t) => {
                    const tripId = t.id || slugify(t.name);
                    const open = () => navigate(`/trip/${tripId}`, { state: { trip: t } });
                    return (
                      <div
                        key={tripId}
                        className="tripRow tripRowClickable"
                        role="button"
                        tabIndex={0}
                        onClick={open}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
                      >
                        <div className="tripThumb" style={{ backgroundImage: `url(${t.img})` }} />
                        <div className="tripRowBody">
                          <div className="tripRowName">{t.name}</div>
                          <div className="tripRowMeta">{t.meta}</div>
                        </div>
                        <span className="tripBadge">Completed</span>
                        <span className="tripChev">&rsaquo;</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="emptyPanel">
                  <p>No trips yet.</p>
                  <button className="addCtaBtn" onClick={() => navigate("/home")}>
                    <Icon.plus /> Plan your first trip
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Saved Places */}
          {nav === "saved" && (
            <div className="contentPanel">
              <div className="panelHead">
                <h2 className="panelTitle">Saved Places</h2>
              </div>
              <p className="vsSub">Places you've hearted to revisit later.</p>
              {savedPlaces.length > 0 ? (
                <div className="favPlacesGrid">
                  {savedPlaces.map((p) => (
                    <FavoriteCard
                      key={p.id}
                      place={p}
                      isFav={true}
                      popping={poppingHeart === p.id}
                      onCardClick={() => showToast("Coming soon: place details")}
                      onToggle={() => toggleFavorite(p.id, p.name)}
                    />
                  ))}
                </div>
              ) : (
                <div className="emptyPanel">
                  <p>No saved places yet.</p>
                  <p style={{ fontSize: 13 }}>Tap the heart on a place to save it here.</p>
                </div>
              )}
            </div>
          )}

          {/* Travel interests */}
          {nav === "interests" && (
            <div className="contentPanel">
              <div className="panelHead">
                <h2 className="panelTitle">Travel interests</h2>
              </div>
              <p className="vsSub">Tap to add or remove what excites you most.</p>
              {interests.size === 0 && (
                <p className="hintLine">Tap any tag below to add it to your profile.</p>
              )}
              <div className="profPills">
                {INTERESTS.map((tag) => (
                  <button
                    key={tag}
                    className={`profPill ${interests.has(tag) ? "on" : ""}`}
                    onClick={() => toggleInterest(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Travel preferences */}
          {nav === "preferences" && (
            <div className="contentPanel">
              <div className="panelHead">
                <h2 className="panelTitle">Travel preferences</h2>
              </div>
              <p className="vsSub">Customize how you like to travel — keeps your AI plans on point.</p>

              <div className="prefGroup">
                <h3 className="prefGroupLabel"><span aria-hidden="true">🪂</span> Adventure level</h3>
                <div className="profPills">
                  {ADVENTURE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      className={`profPill ${adventure === lvl ? "on" : ""}`}
                      onClick={() => setAdventure(lvl)}
                      aria-pressed={adventure === lvl}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="prefGroup">
                <h3 className="prefGroupLabel"><span aria-hidden="true">💰</span> Budget style</h3>
                <div className="profPills">
                  {BUDGET_STYLES.map((b) => (
                    <button
                      key={b}
                      className={`profPill ${budgetStyle === b ? "on" : ""}`}
                      onClick={() => setBudgetStyle(b)}
                      aria-pressed={budgetStyle === b}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="prefGroup">
                <h3 className="prefGroupLabel"><span aria-hidden="true">🏨</span> Accommodation</h3>
                <div className="profPills">
                  {ACCOMMODATIONS.map((a) => (
                    <button
                      key={a}
                      className={`profPill ${accommodation.has(a) ? "on" : ""}`}
                      onClick={() => toggleSetMember(setAccommodation, a)}
                      aria-pressed={accommodation.has(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="prefGroup">
                <h3 className="prefGroupLabel"><span aria-hidden="true">🍴</span> Food preferences</h3>
                <div className="profPills">
                  {FOOD_PREFS.map((f) => (
                    <button
                      key={f}
                      className={`profPill ${food.has(f) ? "on" : ""}`}
                      onClick={() => toggleSetMember(setFood, f)}
                      aria-pressed={food.has(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {nav === "about" && editing && (
        <button className="doneBtn" onClick={handleDone}>Done</button>
      )}
      {ToastNode}
    </div>
  );
}
