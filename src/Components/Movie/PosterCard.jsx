import { Link } from "react-router-dom";
import { Check, Eye, Heart, Star } from "lucide-react";
import { posterSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { titleKey, useLibraryKeys, useQuickWishlist } from "../../Hooks/useLibraryKeys";
import { Mark } from "../Layout/Wordmark";
import { Badge } from "../UI/Section";
import { Skeleton } from "../UI/States";

// A poster, or, when TMDB has none, the title set on a flat panel with the mark: never a broken
// image or a stock placeholder.
export function Poster({ path, title, sizes = "(min-width: 1024px) 220px, 42vw", eager = false, className = "" }) {
  if (!path) {
    return (
      <div className={`flex aspect-[2/3] w-full flex-col justify-between bg-raised p-3.5 ${className}`}>
        <Mark size={22} className="opacity-60" />
        <span className="display text-[1.35rem] leading-[1.05] text-muted">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={tmdbImage(path, "w342")}
      srcSet={posterSrcSet(path)}
      sizes={sizes}
      alt={`${title} poster`}
      width="342"
      height="513"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`aspect-[2/3] w-full bg-raised object-cover ${className}`}
    />
  );
}

const STATUS_BADGES = {
  WATCHED: { icon: Check, label: "Watched", tone: "positive" },
  WATCHING: { icon: Eye, label: "Watching", tone: "dark" },
  PLAN_TO_WATCH: { icon: null, label: "Planned", tone: "dark" },
};

// The one card every list of films uses. What the viewer has done with it (watched, wishlisted,
// their own score) comes from the shared library keys, so a page of 40 cards makes no extra calls.
export function PosterCard({ item, sizes, subline, badge, userRating, eager = false, showWishlist = true }) {
  const keys = useLibraryKeys();
  const toggleWishlist = useQuickWishlist();
  const key = titleKey(item);
  const wishlisted = keys.wishlist.has(key);
  const status = keys.statuses[key];
  const myRating = userRating ?? keys.ratings[key];
  const statusBadge = STATUS_BADGES[status];

  return (
    <article className="group relative">
      <Link to={titleHref(item)} className="block rounded-poster focus-visible:outline-offset-4">
        <div className="relative overflow-hidden rounded-poster bg-raised transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-soft)] can-hover:group-hover:-translate-y-1 can-hover:group-hover:shadow-lift">
          <Poster
            path={item.posterPath}
            title={item.title}
            sizes={sizes}
            eager={eager}
            className="transition-transform duration-500 ease-[var(--ease-out-soft)] can-hover:group-hover:scale-[1.05]"
          />
          {(statusBadge || badge) && (
            <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
              {statusBadge && (
                <Badge tone={statusBadge.tone}>
                  {statusBadge.icon && <statusBadge.icon size={12} strokeWidth={2.5} aria-hidden="true" />}
                  {statusBadge.label}
                </Badge>
              )}
              {badge && !statusBadge && <Badge>{badge}</Badge>}
            </div>
          )}
        </div>
        <div className="mt-3 min-w-0">
          <h3 className="truncate text-ui font-medium leading-snug text-ink transition-colors can-hover:group-hover:text-accent">{item.title}</h3>
          <p className="num mt-1 flex items-center gap-1.5 truncate text-[13px] text-faint">
            {subline ?? (
              <>
                <span>{item.year || "TBA"}</span>
                {item.mediaType === "tv" && <><span aria-hidden="true">·</span><span>Series</span></>}
                {myRating ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-accent">
                      <Star size={11} fill="currentColor" aria-hidden="true" />
                      <span><span className="sr-only">Your rating </span>{myRating}</span>
                    </span>
                  </>
                ) : item.rating > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={11} aria-hidden="true" />
                      <span><span className="sr-only">TMDB rating </span>{item.rating.toFixed(1)}</span>
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </Link>

      {showWishlist && (
        <button
          type="button"
          onClick={() => toggleWishlist(item, wishlisted)}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`}
          className={`absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset transition-[opacity,transform,background-color] duration-200 active:scale-90 ${
            wishlisted
              ? "bg-accent text-accent-ink ring-transparent"
              : "bg-black/65 text-ink ring-white/15 can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:hover:bg-black/85 focus-visible:opacity-100"
          }`}
        >
          <Heart size={16} fill={wishlisted ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

export function PosterCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-[2/3] w-full rounded-poster" />
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  );
}
