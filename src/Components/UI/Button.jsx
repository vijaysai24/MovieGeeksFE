import { Link } from "react-router-dom";

// One button shape on the whole product: a full pill. Primary is warm white on black; amber is
// kept for the single main action of a screen. Labels are Title Case and name what happens.
const VARIANTS = {
  primary: "bg-ink text-ground can-hover:hover:bg-white",
  accent: "bg-accent text-accent-ink can-hover:hover:bg-accent-hover",
  secondary: "bg-raised text-ink can-hover:hover:bg-nested",
  outline: "text-ink ring-1 ring-inset ring-control can-hover:hover:bg-white/[0.06] can-hover:hover:ring-[#5a5a60]",
  ghost: "text-muted can-hover:hover:text-ink can-hover:hover:bg-white/[0.06]",
  danger: "text-negative ring-1 ring-inset ring-[#5a2a34] can-hover:hover:bg-[#2c1a20]",
  // For controls laid over a picture: an opaque dark disc that holds up on any image.
  overlay: "bg-black/65 text-ink ring-1 ring-inset ring-white/15 can-hover:hover:bg-black/85",
  onLight: "bg-light-ink text-light can-hover:hover:bg-[#2b2b2b]",
};

const SIZES = {
  sm: "h-8 px-3.5 text-[13px] gap-1.5",
  md: "h-10 px-5 text-[15px] gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

export const buttonClass = ({ variant = "secondary", size = "md", full = false, className = "" } = {}) => [
  "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap select-none",
  "transition-[background-color,box-shadow,transform,color] duration-150 active:scale-[0.97]",
  "disabled:pointer-events-none disabled:opacity-60",
  VARIANTS[variant],
  SIZES[size],
  full ? "w-full" : "",
  className,
].join(" ");

export function Button({ variant, size, full, className, type = "button", ...props }) {
  return <button type={type} className={buttonClass({ variant, size, full, className })} {...props} />;
}

export function LinkButton({ variant, size, full, className, ...props }) {
  return <Link className={buttonClass({ variant, size, full, className })} {...props} />;
}

const ICON_SIZES = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };

// Icon-only controls always carry an accessible name.
export function IconButton({ label, className = "", children, active = false, variant = "ghost", size = "md", type = "button", ...props }) {
  const tone = active
    ? "bg-ink text-ground"
    : variant === "overlay"
      ? VARIANTS.overlay
      : "text-muted can-hover:hover:bg-white/[0.08] can-hover:hover:text-ink";
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex flex-none items-center justify-center rounded-full transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.94] disabled:pointer-events-none disabled:opacity-35 ${ICON_SIZES[size]} ${tone} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
