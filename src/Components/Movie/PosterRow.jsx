import { PosterCard, PosterCardSkeleton } from "./PosterCard";
import { Rail } from "../UI/Rail";

// A rail of poster cards.
export function PosterRow({ title, subtitle, items = [], loading = false, href, hrefLabel, badgeOf, sublineOf, ratingOf, className = "" }) {
  if (!loading && !items.length) return null;

  return (
    <Rail title={title} subtitle={subtitle} href={href} hrefLabel={hrefLabel} count={loading ? -1 : items.length} className={className}>
      {(loading ? Array.from({ length: 8 }, (_, index) => ({ id: index })) : items).map((item, index) => (
        <div key={loading ? index : `${item.mediaType}:${item.id}`} className="w-[42vw] flex-none snap-start sm:w-[190px] lg:w-[204px] 2xl:w-[220px]">
          {loading ? (
            <PosterCardSkeleton />
          ) : (
            <PosterCard
              item={item}
              sizes="(min-width: 1024px) 220px, 42vw"
              badge={badgeOf?.(item)}
              subline={sublineOf?.(item)}
              userRating={ratingOf?.(item)}
            />
          )}
        </div>
      ))}
    </Rail>
  );
}
