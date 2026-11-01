import { Link } from "react-router-dom";
import { backdropSrcSet, posterSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { Skeleton } from "../UI/States";
import { Reveal } from "../UI/Reveal";

// The row's rhythm: a tall poster, a pair of stills, a wide still, repeating.
const PATTERN = ["tall", "pair", "wide", "pair", "tall", "wide"];

function Still({ item, className = "" }) {
  return (
    <Link
      to={titleHref(item)}
      aria-label={`${item.title} (${item.year || "TBA"})`}
      className={`group relative block overflow-hidden bg-raised ${className}`}
    >
      <img
        src={tmdbImage(item.backdropPath, "w780")}
        srcSet={backdropSrcSet(item.backdropPath)}
        sizes="(min-width: 768px) 40vw, 88vw"
        alt=""
        width="780"
        height="439"
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
      />
      <span className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-sm text-ink">
        {item.title} <span className="text-muted">{item.year}</span>
      </span>
    </Link>
  );
}

function TallPoster({ item }) {
  return (
    <Link to={titleHref(item)} aria-label={`${item.title} (${item.year || "TBA"})`} className="group block h-full flex-none snap-start overflow-hidden bg-raised" style={{ aspectRatio: "2 / 3" }}>
      <img
        src={tmdbImage(item.posterPath, "w500")}
        srcSet={posterSrcSet(item.posterPath)}
        sizes="(min-width: 768px) 30vw, 72vw"
        alt={`${item.title} poster`}
        width="500"
        height="750"
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
      />
    </Link>
  );
}

const buildModules = (items) => {
  const posters = items.filter((item) => item.posterPath);
  const stills = items.filter((item) => item.backdropPath);
  const used = new Set();
  const take = (pool) => {
    const item = pool.find((candidate) => !used.has(candidate.id));
    if (item) used.add(item.id);
    return item;
  };

  const modules = [];
  for (let step = 0; modules.length < 9; step++) {
    const kind = PATTERN[step % PATTERN.length];
    if (kind === "tall") {
      const item = take(posters);
      if (!item) break;
      modules.push({ kind, items: [item] });
    } else if (kind === "pair") {
      const first = take(stills);
      const second = take(stills);
      if (!first || !second) break;
      modules.push({ kind, items: [first, second] });
    } else {
      const item = take(stills);
      if (!item) break;
      modules.push({ kind, items: [item] });
    }
  }
  return { modules, count: used.size };
};

function GemsGallery({ items = [], loading }) {
  const { modules, count } = buildModules(items);

  return (
    <section className="mt-[clamp(120px,14vw,200px)]" aria-labelledby="gems-title">
      <Reveal className="mb-8 flex items-baseline justify-between gap-6 px-5 md:pl-[6vw] md:pr-8">
        <div>
          <h2 id="gems-title" className="display text-[clamp(2rem,3vw,2.25rem)] text-ink">Hidden gems</h2>
          <p className="mt-2 max-w-[52ch] text-base text-muted">
            Loved by the people who found them, still waiting for everyone else.
          </p>
        </div>
        <Link to="/discover?list=hidden_gems" className="num flex-none text-base text-muted hover:text-ink">
          {loading ? "" : `${count} films`}
        </Link>
      </Reveal>

      <div className="hide-scrollbar flex h-[62svh] snap-x snap-proximity gap-2 overflow-x-auto scroll-pl-5 pl-5 md:h-[68svh] md:gap-3 md:scroll-pl-[6vw] md:pl-[6vw]">
        {loading && Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-full w-[72vw] flex-none rounded-none md:w-[30vw]" />)}
        {modules.map((module, index) => {
          if (module.kind === "tall") return <TallPoster key={index} item={module.items[0]} />;
          if (module.kind === "pair") {
            return (
              <div key={index} className="flex h-full w-[64vw] flex-none snap-start flex-col gap-2 md:w-[min(34vw,560px)] md:gap-3">
                <Still item={module.items[0]} className="min-h-0 flex-1" />
                <Still item={module.items[1]} className="min-h-0 flex-1" />
              </div>
            );
          }
          return (
            <div key={index} className="flex h-full flex-none snap-start items-center">
              <Still item={module.items[0]} className="h-[70%] w-[88vw] md:h-full md:w-auto md:[aspect-ratio:16/10]" />
            </div>
          );
        })}
        <div className="w-3 flex-none" aria-hidden="true" />
      </div>
    </section>
  );
}

export default GemsGallery;
