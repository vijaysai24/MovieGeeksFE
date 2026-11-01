import { Link } from "react-router-dom";
import { posterSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { Skeleton } from "../UI/States";

export function Poster({ path, title, sizes = "(min-width: 1024px) 200px, 40vw", eager = false, className = "" }) {
  if (!path) {
    // No poster exists for this title: its name set on a flat panel, never a stock placeholder.
    return (
      <div className={`flex aspect-[2/3] items-end bg-raised p-3 ${className}`}>
        <span className="display text-lg leading-tight text-muted">{title}</span>
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

// One film or series: poster, title, year, and either its TMDB score or the member's own rating.
export function PosterCard({ item, sizes, subline, userRating, eager = false }) {
  return (
    <Link
      to={titleHref(item)}
      className="group block rounded-[4px] focus-visible:outline-offset-4"
    >
      <div className="overflow-hidden rounded-[4px] bg-raised">
        <Poster
          path={item.posterPath}
          title={item.title}
          sizes={sizes}
          eager={eager}
          className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-2.5 min-w-0">
        <p className="truncate text-sm font-medium text-ink group-hover:text-accent">{item.title}</p>
        <p className="num mt-0.5 flex items-center gap-2 truncate text-[13px] text-faint">
          {subline ?? (
            <>
              <span>{item.year || "TBA"}</span>
              {item.mediaType === "tv" && <span>Series</span>}
              {userRating ? (
                <span className="text-accent">{userRating} /10</span>
              ) : (
                item.rating > 0 && <span>{item.rating.toFixed(1)}</span>
              )}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

export function PosterCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] w-full rounded-[4px]" />
      <Skeleton className="mt-2.5 h-3.5 w-4/5" />
      <Skeleton className="mt-1.5 h-3 w-1/3" />
    </div>
  );
}
