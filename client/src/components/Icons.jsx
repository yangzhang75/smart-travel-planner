// ───── Icons ─────
export const Icon = {
  bell: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  ),
  hamburger: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}>
      <path d="M2 4h12M2 8h12M2 12h12" />
    </svg>
  ),
  calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  ),
  users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="9" r="3.2" /><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6" />
      <circle cx="17" cy="8" r="2.6" /><path d="M15.5 14.2c2.6.3 5 2.6 5 5.8" />
    </svg>
  ),
  wallet: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="6" width="18" height="14" rx="2" /><path d="M16 13h2" /><path d="M3 10h18" />
    </svg>
  ),
  arrowRight: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  sparkle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  ),
  person: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  suitcase: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  heart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.8 6.6a5.5 5.5 0 0 0-9-1.7l-.3.3-.3-.3a5.5 5.5 0 1 0-7.8 7.8l8.1 8.1 8.1-8.1a5.5 5.5 0 0 0 1.2-6.1z" />
    </svg>
  ),
  gear: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  help: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" /><circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  ),
  logout: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M15 17l5-5-5-5M20 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </svg>
  ),
  chevL: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),
  chevR: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  info: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="8" r="0.6" fill="currentColor" />
    </svg>
  ),
  link: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  ),
  cloud: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 18h10a4 4 0 0 0 .9-7.9 6 6 0 0 0-11.6-1A4 4 0 0 0 7 18z" />
    </svg>
  ),
  cloudOff: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 3l18 18" />
      <path d="M17.6 17.6A4 4 0 0 1 17 18H7a4 4 0 0 1-1.5-7.7" />
      <path d="M9 6.5A6 6 0 0 1 17.9 10a4 4 0 0 1 2.7 6" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  ),
  sun: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  fork: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 3v7a2 2 0 0 0 4 0V3" /><path d="M9 13v8" />
      <path d="M16 3c-1.5 1.5-2 3-2 5s.5 3.5 2 5v8" />
    </svg>
  ),
  walk: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="13" cy="4" r="1.6" />
      <path d="M9 21l2-7-3-3 1-5 4 2 3 3" /><path d="M14 14l3 1 1 5" />
    </svg>
  ),
  map: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" />
    </svg>
  ),
  copy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  ),
};

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.37 12.6c-.03-2.65 2.16-3.92 2.26-3.98-1.23-1.8-3.15-2.05-3.83-2.08-1.63-.16-3.18.96-4.01.96-.83 0-2.1-.94-3.46-.91-1.78.03-3.42 1.04-4.34 2.63-1.85 3.21-.47 7.95 1.33 10.55.88 1.27 1.93 2.7 3.3 2.65 1.32-.05 1.83-.85 3.43-.85 1.6 0 2.06.85 3.46.83 1.43-.03 2.34-1.3 3.21-2.58 1.01-1.48 1.43-2.91 1.45-2.99-.03-.01-2.78-1.07-2.8-4.23zM13.7 4.94c.72-.88 1.21-2.1 1.07-3.32-1.04.04-2.3.69-3.05 1.56-.67.78-1.26 2.03-1.1 3.22 1.16.09 2.36-.59 3.08-1.46z" />
    </svg>
  );
}

// ───── Profile field icons ─────
const ProfIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props} />
);
export const MapPin = () => (<ProfIcon><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></ProfIcon>);
export const Briefcase = () => (<ProfIcon><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></ProfIcon>);
export const GradCap = () => (<ProfIcon><path d="M2 9l10-4 10 4-10 4L2 9z"/><path d="M6 11v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4"/><path d="M22 9v5"/></ProfIcon>);
export const GlobeIcon = () => (<ProfIcon><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.8 3 4.2 6 4.2 9s-1.4 6-4.2 9c-2.8-3-4.2-6-4.2-9s1.4-6 4.2-9z"/></ProfIcon>);
export const Compass = () => (<ProfIcon><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/></ProfIcon>);
export const MusicIcon = () => (<ProfIcon><path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/></ProfIcon>);
export const Bolt = () => (<ProfIcon><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></ProfIcon>);
export const HeartIcon = () => (<ProfIcon><path d="M20.8 6.6a5.5 5.5 0 0 0-9-1.7l-.3.3-.3-.3a5.5 5.5 0 1 0-7.8 7.8l8.1 8.1 8.1-8.1a5.5 5.5 0 0 0 1.2-6.1z"/></ProfIcon>);
export const UserNav = () => (<ProfIcon><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></ProfIcon>);
export const SuitcaseNav = () => (<ProfIcon><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></ProfIcon>);
export const TagNav = () => (<ProfIcon><path d="M20.5 12.5l-8 8a2 2 0 0 1-2.8 0l-7.2-7.2V4h9.3l8.7 8.7c.4.4.4 1 0 1.4l.1-1.6z"/><circle cx="7.5" cy="7.5" r="1.5"/></ProfIcon>);
export const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
