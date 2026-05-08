import { GoogleIcon, AppleIcon } from "./Icons";

export const PHOTO_OVERLAY =
  "linear-gradient(180deg, rgba(20, 32, 24, 0.55) 0%, rgba(20, 32, 24, 0.42) 45%, rgba(20, 32, 24, 0.78) 100%)";

export const SLIDES = [
  {
    eyebrow: "Smart travel planning",
    title: (<>Plan smarter. <em>Travel better.</em></>),
    body: "Voyage.ai turns a one-line idea into a thoughtful itinerary \u2014 built around your dates, your people, and your budget.",
  },
  {
    eyebrow: "Made for the way you go",
    title: (<>Less spreadsheets. <em>More wandering.</em></>),
    body: "Skip the tab-juggling. Tell us where, when, and who \u2014 we\u2019ll draft a plan you can actually take with you.",
  },
  {
    eyebrow: "Always one step ahead",
    title: (<>Your itinerary, <em>already written.</em></>),
    body: "From hidden caf\u00e9s in Tokyo to weekend escapes in Paris, every trip starts with a draft you can shape your way.",
  },
];

export function BrandPanel({ activeIndex, onDot, photo }) {
  const slide = SLIDES[activeIndex];
  const bg = `${PHOTO_OVERLAY}, url("${photo}")`;
  return (
    <aside className="brandPanel" style={{ backgroundImage: bg }}>
      <div className="brandLogo">voyage<span>.ai</span></div>
      <div className="brandCenter">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>
      <div className="brandFooter">
        <div className="dots" role="tablist" aria-label="Brand messages">
          {SLIDES.map((_, i) => (
            <span key={i} role="tab" aria-selected={i === activeIndex} className={i === activeIndex ? "active" : ""} onClick={() => onDot(i)} style={{ cursor: "pointer" }} />
          ))}
        </div>
        <div className="micro">&copy; Voyage.ai &middot; 2026</div>
      </div>
    </aside>
  );
}

export function OauthGroup() {
  return (
    <>
      <div className="divider"><span>or continue with</span></div>
      <div className="oauthStack">
        <button type="button" className="btnOauth"><GoogleIcon /> Continue with Google</button>
        <button type="button" className="btnOauth"><AppleIcon /> Continue with Apple</button>
      </div>
    </>
  );
}

export function Legal() {
  return (
    <p className="legal">
      By continuing, you agree to Voyage&rsquo;s{" "}
      <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
    </p>
  );
}
