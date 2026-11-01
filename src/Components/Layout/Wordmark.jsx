import { Link } from "react-router-dom";

// The mark: an amber disc with a notch, a projector lens catching light. Drawn once, used everywhere.
export function Mark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
      <circle cx="12" cy="12" r="11" fill="#f5b02e" />
      <circle cx="12" cy="12" r="4.2" fill="#000" />
      <circle cx="16.4" cy="7.6" r="1.6" fill="#000" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Movie Geeks home">
      <Mark />
      <span className="display text-[22px] leading-none tracking-[-0.01em] text-ink">Movie Geeks</span>
    </Link>
  );
}
