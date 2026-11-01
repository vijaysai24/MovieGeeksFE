import { Link } from "react-router-dom";

// One button shape on the whole product: a full pill. Primary is inverted white on black; the amber
// accent is kept for the one action of a page.
const VARIANTS = {
  primary: "bg-ink text-ground hover:bg-[#dcdcdc]",
  accent: "bg-accent text-accent-ink hover:bg-[#ffc14d]",
  secondary: "text-ink ring-1 ring-inset ring-control hover:bg-white/[0.06] hover:ring-[#6a6a6a]",
  ghost: "text-muted hover:text-ink hover:bg-white/[0.06]",
  danger: "text-negative ring-1 ring-inset ring-[#5a2a34] hover:bg-[#2c1a20]",
  onLight: "bg-light-ink text-light hover:bg-[#2b2b2b]",
};

const SIZES = {
  sm: "h-8 px-3.5 text-[13px] gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
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

// Icon-only controls always carry an accessible name.
export function IconButton({ label, className = "", children, active = false, type = "button", ...props }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 flex-none items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-[0.94] ${
        active ? "bg-ink text-ground" : "text-muted hover:bg-white/[0.08] hover:text-ink"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
