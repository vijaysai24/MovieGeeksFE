import { useState } from "react";
import { posterSrcSet, tmdbImage } from "../../Services/images";
import { useProviders } from "../../Hooks/useCatalogReference";
import { regionName } from "../../Hooks/useRegion";
import { RatingInput } from "../UI/RatingInput";
import { Reveal } from "../UI/Reveal";

function Module({ title, children, panel, index }) {
  return (
    <Reveal index={index % 2} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
      <div data-ui className="w-full flex-none overflow-hidden rounded-lg bg-surface sm:w-[360px]">
        {panel}
      </div>
      <div className="sm:w-[260px] sm:pt-1">
        <h3 className="text-[18px] font-medium text-ink">{title}</h3>
        <div className="mt-2 space-y-3 text-base leading-relaxed text-muted">{children}</div>
      </div>
    </Reveal>
  );
}

function FivePanel({ films }) {
  return (
    <div className="p-4">
      <p className="mb-3 text-[13px] text-faint">Your five</p>
      <div className="grid grid-cols-5 gap-1.5">
        {films.slice(0, 5).map((film) => (
          <img
            key={film.id}
            src={tmdbImage(film.posterPath, "w185")}
            srcSet={posterSrcSet(film.posterPath)}
            sizes="64px"
            alt={`${film.title} poster`}
            width="64"
            height="96"
            loading="lazy"
            className="aspect-[2/3] w-full rounded-[3px] bg-raised object-cover"
          />
        ))}
      </div>
    </div>
  );
}

const dayLabel = (daysAgo) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(Date.now() - daysAgo * 86400000));

function DiaryPanel({ films }) {
  // Sample entries for the interface: real titles, dates relative to today.
  const rows = films.slice(0, 3).map((film, index) => ({ film, date: dayLabel([1, 4, 9][index]), rating: [9, 7, 8][index], rewatch: index === 2 }));
  return (
    <ul className="px-4 py-2">
      {rows.map(({ film, date, rating, rewatch }) => (
        <li key={film.id} className="flex items-center gap-3 py-2">
          <span className="num w-14 flex-none text-[13px] text-faint">{date}</span>
          <span className="min-w-0 flex-1 truncate text-sm text-ink">
            {film.title}
            {rewatch && <span className="ml-2 text-[13px] text-faint">rewatch</span>}
          </span>
          <span className="num flex-none text-sm"><span className="font-semibold text-accent">{rating}</span><span className="text-faint"> /10</span></span>
        </li>
      ))}
    </ul>
  );
}

function SpoilerPanel({ film }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="p-4">
      <p className="text-[13px] text-faint">Your review of {film?.title || "a film"}</p>
      <div className="relative mt-2">
        <p className={`text-sm leading-relaxed text-ink transition-[filter] duration-300 ${revealed ? "" : "select-none blur-[6px]"}`} aria-hidden={!revealed}>
          The last twenty minutes turn the whole film inside out. Everything you trusted in the first act was the trap, and the final shot makes you want to start again.
        </p>
        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="absolute inset-0 m-auto h-8 w-fit rounded-full bg-ink px-3.5 text-[13px] font-medium text-ground transition-transform active:scale-95"
          >
            Contains spoilers · Show
          </button>
        )}
      </div>
    </div>
  );
}

function ProvidersPanel({ region }) {
  const { data: providers = [] } = useProviders("movie", region);
  return (
    <div className="p-4">
      <p className="mb-3 text-[13px] text-faint">Streaming in {regionName(region)}</p>
      <div className="grid grid-cols-6 gap-2">
        {providers.slice(0, 12).map((provider) => (
          <img
            key={provider.id}
            src={tmdbImage(provider.logoPath, "w92")}
            alt={provider.name}
            title={provider.name}
            width="44"
            height="44"
            loading="lazy"
            className="aspect-square w-full rounded-lg bg-raised object-cover"
          />
        ))}
      </div>
    </div>
  );
}

function RatingPanel({ film }) {
  const [value, setValue] = useState(8);
  return (
    <div className="p-4">
      <RatingInput value={value} onChange={(next) => setValue(next === value ? null : next)} size="sm" label={`Rate ${film?.title || "it"}`} />
      <p className="num mt-3 text-[13px] text-faint">TMDB members gave it {film?.rating?.toFixed(1) ?? "-"}</p>
    </div>
  );
}

// What signing up gets you, each shown as the working piece of the product it describes.
function IdentityFeatures({ films = [], region }) {
  if (films.length < 5) return null;
  const reviewFilm = films[5] || films[0];

  return (
    <section className="mx-auto mt-[clamp(120px,14vw,200px)] max-w-[1440px] px-5 md:px-8" aria-labelledby="identity-title">
      <div className="md:ml-[18%]">
        <Reveal>
          <h2 id="identity-title" className="display text-[clamp(2rem,3vw,2.5rem)] text-ink">Built around your taste</h2>
          <p className="mt-3 max-w-[48ch] text-base text-muted">
            A profile here is a record of what you love, not a list of what's popular.
          </p>
        </Reveal>
        <div className="mt-16 space-y-16 md:space-y-24">
          <Module index={0} title="Your five, front and centre" panel={<FivePanel films={films} />}>
            <p>Pick the five films that say the most about you. They open your profile before anything else does.</p>
            <p>Change them whenever your taste moves on.</p>
          </Module>
          <Module index={1} title="A diary that remembers" panel={<DiaryPanel films={films} />}>
            <p>Log each viewing with its date, a score out of ten and a note.</p>
            <p>Rewatches are counted on their own, so your favourites show up as favourites.</p>
          </Module>
          <Module index={2} title="Out of ten, and yours" panel={<RatingPanel film={films[1]} />}>
            <p>Your scores sit apart from TMDB and IMDb on every page, so you can see where you and the crowd part ways.</p>
          </Module>
          <Module index={3} title="Spoilers stay shut" panel={<SpoilerPanel film={reviewFilm} />}>
            <p>Mark a review as containing spoilers and it stays covered until a reader chooses to open it.</p>
          </Module>
          <Module index={4} title="Where to watch, for your country" panel={<ProvidersPanel region={region} />}>
            <p>Every title shows which services carry it where you live, and whether it's still only in cinemas.</p>
          </Module>
        </div>
      </div>
    </section>
  );
}

export default IdentityFeatures;
