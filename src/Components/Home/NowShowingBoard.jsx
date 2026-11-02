import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { tmdbImage, titleHref } from "../../Services/images";
import { formatDayMonth } from "../../Services/format";
import { genreNames, useGenres } from "../../Hooks/useCatalogReference";
import { regionName } from "../../Hooks/useRegion";
import { Skeleton } from "../UI/States";
import { Reveal } from "../UI/Reveal";

const STATUS = {
  cinema: { label: "In Cinemas", className: "bg-accent text-accent-ink" },
  streaming: { label: "Streaming", className: "bg-[#13281c] text-positive" },
  soon: { label: null, className: "bg-nested text-ink" },
};

// What's on this week, set like a cinema departure board: one band per film, a status block at
// the end of each, and one band open with its story. Choosing another band opens that one.
function NowShowingBoard({ inCinemas = [], newOnStreaming = [], comingToStreaming = [], loading, region }) {
  const { data: genres = [] } = useGenres();
  const rows = [
    ...inCinemas.slice(0, 4).map((item) => ({ item, kind: "cinema" })),
    ...newOnStreaming.slice(0, 3).map((item) => ({ item, kind: "streaming" })),
    ...comingToStreaming.slice(0, 2).map((item) => ({ item, kind: "soon" })),
  ];
  const [open, setOpen] = useState(3);

  return (
    <section className="section-gap" aria-labelledby="board-title">
      <Reveal className="page mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 id="board-title" className="display text-h2 text-ink">Now Showing</h2>
        <p className="text-ui text-muted">This week in {regionName(region)} · <Link to="/calendar" className="text-ink can-hover:hover:text-accent">Release calendar</Link></p>
      </Reveal>

      <div data-ui className="px-3 md:px-3">
        {loading && <div className="space-y-1">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16 w-full rounded-none md:h-[72px]" />)}</div>}
        <ul className="space-y-1">
          {rows.map(({ item, kind }, index) => {
            const isOpen = index === open;
            const status = STATUS[kind];
            const label = status.label || `Streams ${formatDayMonth(item.releaseDate)}`;
            const facts = [genreNames(item.genreIds, genres).slice(0, 2).join(", "), item.originalLanguage?.toUpperCase(), item.rating ? `TMDB ${item.rating.toFixed(1)}` : null];

            return (
              <li key={`${kind}:${item.id}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 text-left transition-[background-color,height] duration-300 ease-[var(--ease-out-soft)] md:grid-cols-12 md:px-6 ${
                    isOpen ? "bg-raised" : "bg-surface can-hover:hover:bg-raised"
                  } h-16 md:h-[72px]`}
                >
                  <span className="min-w-0 truncate text-[19px] text-ink md:col-span-5 md:text-[clamp(1.25rem,1rem+0.7vw,1.75rem)]">{item.title}</span>
                  <span className="hidden truncate text-[17px] text-muted md:col-span-3 md:block">{facts[0] || " "}</span>
                  <span className="num hidden text-[17px] text-muted md:col-span-1 md:block">{facts[1] || " "}</span>
                  <span className="num hidden text-[17px] text-muted md:col-span-1 md:block">{item.year || " "}</span>
                  <span className={`num justify-self-end whitespace-nowrap rounded-[6px] px-3 py-1.5 text-[14px] font-medium md:col-span-2 ${status.className}`}>{label}</span>
                </button>
                {isOpen && (
                  <div className="grid gap-5 bg-raised px-4 pb-6 pt-1 md:grid-cols-12 md:px-6 md:pb-8">
                    <div className="md:col-span-7">
                      <p className="num text-[15px] text-muted md:hidden">{facts.filter(Boolean).join(" · ")}</p>
                      <p className="mt-1 line-clamp-3 max-w-[62ch] text-read text-ink">{item.overview || "No synopsis yet."}</p>
                      <Link to={titleHref(item)} className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent can-hover:hover:text-accent-hover">
                        {kind === "soon" ? "See Release Details" : "See Where to Watch"}
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                    {item.backdropPath && (
                      <img
                        src={tmdbImage(item.backdropPath, "w780")}
                        alt={`Still from ${item.title}`}
                        width="780"
                        height="439"
                        loading="lazy"
                        className="hidden aspect-video w-full rounded-poster object-cover md:col-span-5 md:block"
                      />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default NowShowingBoard;
