import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icons";
import { useToast } from "../components/Toast";
import "../styles/about.css";

const FEATURES = [
  {
    key: "ai",
    icon: <Icon.sparkle />,
    title: "AI-Powered Planning",
    desc: "Tell our AI where you want to go and it instantly drafts your full itinerary. Adjust any detail just by asking.",
  },
  {
    key: "drag",
    icon: <Icon.suitcase />,
    title: "Drag-and-Drop Itinerary",
    desc: "Build your daily schedule visually. Add destinations, dates, and activities with simple drag and drop.",
  },
  {
    key: "weather",
    icon: <Icon.map />,
    title: "Weather & Map Integration",
    desc: "See forecasted weather and view all your stops on an interactive map powered by geolocation.",
  },
  {
    key: "budget",
    icon: <Icon.wallet />,
    title: "Smart Budgeting",
    desc: "Track spending, compare costs, and stay within your budget while maximizing experiences.",
  },
];

const STATS = [
  { value: "AI-Powered", label: "Engine" },
  { value: "Offline Ready", label: "Always available" },
  { value: "Real-time Sync", label: "Across devices" },
  { value: "Free to start", label: "No card required" },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const { showToast, ToastNode } = useToast();

  return (
    <div className="aboutPage">
      <header className="aboutNav">
        <button
          type="button"
          className="logo logoButton"
          aria-label="Go to home"
          onClick={() => navigate("/home")}
        >
          voyage<span>.ai</span>
        </button>
        <nav className="aboutNavLinks" aria-label="Primary">
          <button className="aboutNavLink active" aria-current="page">About</button>
          <button className="aboutNavLink" onClick={() => navigate("/signin")}>Sign in</button>
          <button
            className="aboutCta"
            onClick={() => navigate("/signup")}
            aria-label="Get started"
          >
            Get started
          </button>
        </nav>
      </header>

      <main>
        <section className="aboutHero" aria-labelledby="aboutHeroTitle">
          <h1 id="aboutHeroTitle" className="aboutHeroTitle">
            About <span className="aboutHeroBrand">Voyage<em>.ai</em></span>
          </h1>
          <p className="aboutHeroSub">
            We believe travel should be smart, not stressful. That's why we built
            an AI-powered planner to make every journey feel effortless.
          </p>
        </section>

        <section className="aboutMission" aria-labelledby="aboutMissionTitle">
          <article className="missionCard">
            <h2 id="aboutMissionTitle" className="missionTitle">Our Mission</h2>
            <span className="missionDivider" aria-hidden="true"></span>
            <p className="missionBody">
              To help travelers plan, organize, and share itineraries in one
              place — without the chaos of booking platforms. We focus on the
              journey, not the transaction.
            </p>
          </article>
        </section>

        <section className="aboutOffer" aria-labelledby="aboutOfferTitle">
          <h2 id="aboutOfferTitle" className="aboutSectionTitle">What we offer</h2>
          <div className="offerGrid">
            {FEATURES.map((f) => (
              <article className="offerCard" key={f.key}>
                <span className="offerIconWrap" aria-hidden="true">{f.icon}</span>
                <h3 className="offerTitle">{f.title}</h3>
                <p className="offerDesc">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="aboutStats" aria-label="Why choose Voyage.ai">
          <div className="statsRow">
            {STATS.map((s) => (
              <div className="statCol" key={s.value}>
                <div className="statValue">{s.value}</div>
                <div className="statLabel">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="aboutCtaSection" aria-labelledby="aboutCtaTitle">
          <h2 id="aboutCtaTitle" className="aboutCtaTitle">Ready to plan smarter?</h2>
          <p className="aboutCtaSub">Start your first trip in seconds.</p>
          <button
            className="aboutCtaBig"
            onClick={() => navigate("/signup")}
            aria-label="Get started — sign up"
          >
            <Icon.sparkle />
            Get started
          </button>
        </section>
      </main>

      <footer className="aboutFooter">
        <span className="aboutCopy">© 2026 Voyage.ai. All rights reserved.</span>
        <nav className="aboutFootLinks" aria-label="Footer">
          <button className="aboutFootLink" onClick={() => showToast("Privacy policy — coming soon")}>Privacy</button>
          <button className="aboutFootLink" onClick={() => showToast("Terms — coming soon")}>Terms</button>
          <button className="aboutFootLink" onClick={() => showToast("Contact us — coming soon")}>Contact</button>
        </nav>
      </footer>
      {ToastNode}
    </div>
  );
}
