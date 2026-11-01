import { Link } from "react-router-dom";

// The Cinefile mark: a strip of film filed in a folder. One shape, with the sprocket holes and the
// frame cut through it, so it works on any ground. Keep in step with public/logo-mark.svg.
const MARK_PATH = "M5.5 6h6.6c.58 0 1.12.27 1.47.73L15.2 9h11.3A2.5 2.5 0 0 1 29 11.5v13a2.5 2.5 0 0 1-2.5 2.5h-21A2.5 2.5 0 0 1 3 24.5v-16A2.5 2.5 0 0 1 5.5 6zM6 10.8h2a.5 .5 0 0 1 .5.5v1.4a.5 .5 0 0 1-.5.5h-2a.5 .5 0 0 1-.5-.5v-1.4a.5 .5 0 0 1 .5-.5zM12 10.8h2a.5 .5 0 0 1 .5.5v1.4a.5 .5 0 0 1-.5.5h-2a.5 .5 0 0 1-.5-.5v-1.4a.5 .5 0 0 1 .5-.5zM18 10.8h2a.5 .5 0 0 1 .5.5v1.4a.5 .5 0 0 1-.5.5h-2a.5 .5 0 0 1-.5-.5v-1.4a.5 .5 0 0 1 .5-.5zM24 10.8h2a.5 .5 0 0 1 .5.5v1.4a.5 .5 0 0 1-.5.5h-2a.5 .5 0 0 1-.5-.5v-1.4a.5 .5 0 0 1 .5-.5zM6.9 14.8h18.2a1.4 1.4 0 0 1 1.4 1.4v3.6a1.4 1.4 0 0 1-1.4 1.4h-18.2a1.4 1.4 0 0 1-1.4-1.4v-3.6a1.4 1.4 0 0 1 1.4-1.4zM6 22.8h2a.5 .5 0 0 1 .5.5v1.4a.5 .5 0 0 1-.5.5h-2a.5 .5 0 0 1-.5-.5v-1.4a.5 .5 0 0 1 .5-.5zM12 22.8h2a.5 .5 0 0 1 .5.5v1.4a.5 .5 0 0 1-.5.5h-2a.5 .5 0 0 1-.5-.5v-1.4a.5 .5 0 0 1 .5-.5zM18 22.8h2a.5 .5 0 0 1 .5.5v1.4a.5 .5 0 0 1-.5.5h-2a.5 .5 0 0 1-.5-.5v-1.4a.5 .5 0 0 1 .5-.5zM24 22.8h2a.5 .5 0 0 1 .5.5v1.4a.5 .5 0 0 1-.5.5h-2a.5 .5 0 0 1-.5-.5v-1.4a.5 .5 0 0 1 .5-.5z";

export function Mark({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={`flex-none ${className}`}>
      <path fill="#f5b02e" fillRule="evenodd" d={MARK_PATH} />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Cinefile home">
      <Mark />
      <span className="display text-[24px] font-medium leading-none tracking-[-0.01em] text-ink">Cinefile</span>
    </Link>
  );
}
