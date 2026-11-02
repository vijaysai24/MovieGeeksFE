import { Link } from "react-router-dom";

// The heading every page section opens with: a display title, an optional line under it, and at
// most one way onward ("See All") on the right.
export function SectionHead({ id, title, subtitle, href, hrefLabel = "See All", children, as: Heading = "h2", className = "" }) {
  return (
    <div className={`mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 ${className}`}>
      <div className="min-w-0">
        <Heading id={id} className="display text-[clamp(1.75rem,1.3rem+1.3vw,2.375rem)] leading-[1.05] text-ink">{title}</Heading>
        {subtitle && <p className="mt-2 max-w-[60ch] text-ui text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {href && (
          <Link to={href} className="rounded-full px-3 py-2 text-ui text-muted transition-colors can-hover:hover:text-ink">
            {hrefLabel}
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}

// Small labels laid on a poster or still. Opaque, so they read on any picture.
export function Badge({ children, tone = "dark", className = "" }) {
  const tones = {
    dark: "bg-black/75 text-ink",
    accent: "bg-accent text-accent-ink",
    positive: "bg-[#13281c] text-positive",
    light: "bg-light text-light-ink",
  };
  return (
    <span className={`inline-flex h-6 flex-none items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
