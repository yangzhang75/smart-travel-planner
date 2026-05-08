import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Icon,
  MapPin, Briefcase, GradCap, GlobeIcon, Compass, MusicIcon, Bolt, HeartIcon,
  UserNav, SuitcaseNav, TagNav, ArrowLeft,
} from "../components/Icons";

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
  { name: "Rome, Italy", meta: "Jan 2026 \u00b7 7 days", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=320&q=80&auto=format&fit=crop" },
  { name: "Barcelona, Spain", meta: "Oct 2025 \u00b7 5 days", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=320&q=80&auto=format&fit=crop" },
  { name: "Tokyo, Japan", meta: "Apr 2025 \u00b7 10 days", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=320&q=80&auto=format&fit=crop" },
];

const INTERESTS = [
  "Food & Dining", "Photography", "Hiking", "Art & Museums",
  "Nightlife", "Shopping", "History & Culture", "Beach & Water",
  "Adventure", "Nature", "Architecture", "Local Markets",
];

// ───── ProfileField component ─────
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
  const [about, setAbout] = useState("");
  const [aboutEditing, setAboutEditing] = useState(false);
  const [fields, setFields] = useState(
    Object.fromEntries(PROFILE_FIELDS.map((f) => [f.key, ""]))
  );
  const [showStamps, setShowStamps] = useState(true);
  const [interests, setInterests] = useState(new Set(["Food & Dining", "Photography"]));
  const [nav, setNav] = useState("about");
  const [editing, setEditing] = useState(false);

  const setField = (key, val) => setFields((prev) => ({ ...prev, [key]: val }));
  const toggleInterest = (tag) => setInterests((prev) => {
    const next = new Set(prev);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    return next;
  });
  const goEdit = () => { setNav("about"); setEditing(true); };

  const NAV_ITEMS = [
    { key: "about", label: "About me", IconComp: UserNav },
    { key: "past", label: "Past trips", IconComp: SuitcaseNav },
    { key: "interests", label: "Travel interests", IconComp: TagNav },
  ];

  // ── About View ──
  const AboutView = () => (
    <div className="contentPanel">
      <div className="panelHead">
        <h2 className="panelTitle">About me</h2>
        <button className="editPill" onClick={() => setEditing(true)}>Edit</button>
      </div>
      <div className="aboutHero">
        <div className="profileCard">
          <div className="pcAvatar">YL</div>
          <p className="pcName">Yoyo Lai</p>
          <p className="pcSince">Voyager since 2026</p>
          <span className="pcRole">Guest</span>
        </div>
        <div className="completeBox">
          <h3>Complete your profile</h3>
          <p>Your Voyage profile helps fellow travelers get to know you.</p>
          <button className="startBtn" onClick={goEdit}>Get started</button>
        </div>
      </div>
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
      <section className="viewSection">
        <div>
          <h3 className="vsTitle">Travel interests</h3>
          <p className="vsSub">A few of the things you love.</p>
        </div>
        {interests.size === 0 ? (
          <p className="emptyTags">No interests selected yet.</p>
        ) : (
          <div className="tagWrap">
            {[...interests].map((tag) => (
              <span key={tag} className="tagReadOnly">{tag}</span>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  // ── Edit View ──
  const EditView = () => (
    <div className="contentPanel">
      <button className="backLink" onClick={() => setEditing(false)}>&larr; Back to profile</button>
      <div className="panelHead">
        <h2 className="panelTitle">Edit profile</h2>
      </div>

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
            <ProfileField key={f.key} IconComp={f.IconComp} name={f.name} value={fields[f.key]} onChange={(v) => setField(f.key, v)} />
          ))}
        </div>
      </section>

      <section className="profSection">
        <div className="profSectionHead">
          <div>
            <h2 className="profSectionTitle">Where I&apos;ve been</h2>
            <p className="profSectionSub">Pick the stamps you want others to see.</p>
          </div>
          <button className={`toggle ${showStamps ? "on" : ""}`} aria-label="Show stamps on profile" onClick={() => setShowStamps((v) => !v)} />
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
            <button key={tag} className={`profPill ${interests.has(tag) ? "on" : ""}`} onClick={() => toggleInterest(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  // ── Past Trips View ──
  const PastTripsView = () => (
    <div className="contentPanel">
      <div className="panelHead">
        <h2 className="panelTitle">Past trips</h2>
      </div>
      <p className="vsSub" style={{ marginTop: -16 }}>Your completed adventures.</p>
      <div className="tripList">
        {PAST_TRIPS.map((t, i) => (
          <div key={i} className="tripRow">
            <div className="tripThumb" style={{ backgroundImage: `url(${t.img})` }} />
            <div className="tripRowBody">
              <div className="tripRowName">{t.name}</div>
              <div className="tripRowMeta">{t.meta}</div>
            </div>
            <span className="tripBadge">Completed</span>
            <span className="tripChev">&rsaquo;</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Interests View ──
  const InterestsView = () => (
    <div className="contentPanel">
      <div className="panelHead">
        <h2 className="panelTitle">Travel interests</h2>
      </div>
      <p className="vsSub" style={{ marginTop: -16 }}>Tap to add or remove what excites you most.</p>
      <div className="profPills">
        {INTERESTS.map((tag) => (
          <button key={tag} className={`profPill ${interests.has(tag) ? "on" : ""}`} onClick={() => toggleInterest(tag)}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  let rightPanel;
  if (nav === "about") rightPanel = editing ? <EditView /> : <AboutView />;
  else if (nav === "past") rightPanel = <PastTripsView />;
  else rightPanel = <InterestsView />;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">voyage<span>.ai</span></div>
        <div className="navLinks">
          <button className="profIconBtn" aria-label="Back to home" onClick={() => navigate("/home")}><ArrowLeft /></button>
          <button className="profIconBtn" aria-label="Notifications"><Icon.bell /></button>
          <div className="profNavAvatar">YL</div>
        </div>
      </nav>
      <div className="profileShell">
        <aside className="profileNav">
          <h1>Profile</h1>
          {NAV_ITEMS.map(({ key, label, IconComp: IC }) => (
            <button key={key} className={`navItem ${nav === key && !editing ? "active" : ""}`} onClick={() => { setNav(key); setEditing(false); }}>
              <span className="navIcon"><IC /></span>
              {label}
            </button>
          ))}
        </aside>
        {rightPanel}
      </div>
      {nav === "about" && editing && <button className="doneBtn" onClick={() => setEditing(false)}>Done</button>}
    </div>
  );
}
