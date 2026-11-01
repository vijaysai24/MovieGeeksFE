import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PosterCard, PosterCardSkeleton } from "./PosterCard";
import { IconButton } from "../UI/Button";

// A row of posters that scrolls sideways by drag, trackpad or the arrow buttons, snapping to cards.
export function PosterRow({ title, items = [], loading = false, href, hrefLabel = "See all", headingLevel = "h2", ratingOf }) {
  const trackRef = useRef(null);
  const Heading = headingLevel;

  if (!loading && !items.length) return null;

  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <Heading className="text-xl font-semibold tracking-tight text-ink">{title}</Heading>
        <div className="flex items-center gap-1">
          {href && (
            <Link to={href} className="mr-2 text-sm text-muted hover:text-ink">{hrefLabel}</Link>
          )}
          <IconButton label={`Scroll ${title} left`} onClick={() => scroll(-1)} className="max-md:hidden">
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton label={`Scroll ${title} right`} onClick={() => scroll(1)} className="max-md:hidden">
            <ChevronRight size={18} />
          </IconButton>
        </div>
      </div>
      <div
        ref={trackRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {(loading ? Array.from({ length: 8 }, (_, index) => ({ id: index })) : items).map((item, index) => (
          <div key={loading ? index : `${item.mediaType}:${item.id}`} className="w-[38vw] flex-none snap-start sm:w-[180px] lg:w-[190px]">
            {loading ? <PosterCardSkeleton /> : <PosterCard item={item} sizes="190px" userRating={ratingOf?.(item)} />}
          </div>
        ))}
      </div>
    </section>
  );
}
