import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "./Button";
import { SectionHead } from "./Section";

// A titled horizontal rail: swipe, trackpad or the arrow buttons, snapping item by item. The arrows
// switch off at either end so they never promise more than is there, and hide when it all fits.
export function Rail({ id, title, subtitle, href, hrefLabel, count, className = "", trackClassName = "gap-4 md:gap-5", children }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const update = () => setEdges({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [count]);

  const scroll = (direction) => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section aria-labelledby={id} aria-label={id ? undefined : title} className={className}>
      <SectionHead id={id} title={title} subtitle={subtitle} href={href} hrefLabel={hrefLabel}>
        {!(edges.start && edges.end) && (
          <span className="hidden gap-2 md:flex">
            <IconButton label={`Scroll ${title} back`} variant="overlay" disabled={edges.start} onClick={() => scroll(-1)}>
              <ChevronLeft size={18} aria-hidden="true" />
            </IconButton>
            <IconButton label={`Scroll ${title} forward`} variant="overlay" disabled={edges.end} onClick={() => scroll(1)}>
              <ChevronRight size={18} aria-hidden="true" />
            </IconButton>
          </span>
        )}
      </SectionHead>
      <div ref={trackRef} className={`hide-scrollbar flex snap-x snap-mandatory overflow-x-auto pb-4 pt-1 ${trackClassName}`}>
        {children}
      </div>
    </section>
  );
}
