import { avatarSrc } from "../../Services/images";

const hueOf = (seed = "") => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
};

const SIZES = {
  xs: "h-6 w-6 text-[11px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
};

// Every member keeps one stable, muted tint, so people are recognisable before their names are read.
export function Avatar({ user, size = "md", className = "" }) {
  const src = avatarSrc(user?.avatarUrl);
  const label = user?.name || user?.username || "Member";
  const hue = hueOf(user?.username || label);

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width="96"
        height="96"
        loading="lazy"
        className={`flex-none rounded-full object-cover ${SIZES[size]} ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex flex-none items-center justify-center rounded-full font-semibold ${SIZES[size]} ${className}`}
      style={{ background: `hsl(${hue} 28% 20%)`, color: `hsl(${hue} 70% 82%)` }}
    >
      {label.trim().charAt(0).toUpperCase()}
    </span>
  );
}
