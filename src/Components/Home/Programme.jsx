import { Link } from "react-router-dom";
import { backdropSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { genreNames, useGenres } from "../../Hooks/useCatalogReference";
import { regionName } from "../../Hooks/useRegion";
import { Skeleton } from "../UI/States";
import { Reveal } from "../UI/Reveal";

const shortDate = (date) => (date
  ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${date}T00:00:00`))
  : "TBA");

function Group({ title, items, figure, genres, index }) {
  return (
    <Reveal index={index} className="mt-14 first:mt-10">
      <h3 className="text-center text-[22px] text-ink">{title}</h3>
      <ul className="mx-auto mt-5 max-w-[420px] space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={titleHref(item)} className="group block">
              <span className="flex items-baseline justify-between gap-6">
                <span className="truncate text-[17px] text-ink group-hover:text-accent">{item.title}</span>
                <span className="num flex-none text-base text-muted">{figure(item)}</span>
              </span>
              <span className="mt-0.5 block truncate text-sm text-faint">
                {[genreNames(item.genreIds, genres).slice(0, 2).join(", "), item.originalLanguage?.toUpperCase()].filter(Boolean).join(" · ") || " "}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

// The week's listings set like a printed cinema programme, laid on a still from what's showing.
function Programme({ inCinemas = [], comingSoon = [], newOnStreaming = [], loading, region }) {
  const { data: genres = [] } = useGenres();
  const backdrop = inCinemas.find((item) => item.backdropPath) || comingSoon.find((item) => item.backdropPath);
  const weekOf = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }).format(new Date());

  return (
    <section className="relative mt-[clamp(120px,14vw,200px)] overflow-hidden py-16 md:py-[12svh]" aria-labelledby="programme-title">
      {backdrop && (
        <img
          src={tmdbImage(backdrop.backdropPath, "w1280")}
          srcSet={backdropSrcSet(backdrop.backdropPath)}
          sizes="100vw"
          alt={`Still from ${backdrop.title}, showing now`}
          width="1920"
          height="1080"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="relative mx-[10px] md:mx-auto md:grid md:max-w-[1440px] md:grid-cols-12 md:px-8">
        <div className="scalloped bg-paper px-7 py-16 md:col-span-6 md:col-start-7 md:px-16 lg:col-span-5 lg:col-start-8">
          <Reveal>
            <h2 id="programme-title" className="display text-center text-[clamp(2.5rem,4vw,3rem)] text-ink">Now showing</h2>
            <p className="mt-3 text-center text-base text-muted">
              Cinemas and streaming in {regionName(region)}, week of {weekOf}
            </p>
          </Reveal>

          {loading ? (
            <div className="mx-auto mt-12 max-w-[420px] space-y-5">
              {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}
            </div>
          ) : (
            <>
              {inCinemas.length > 0 && (
                <Group title="In cinemas" items={inCinemas.slice(0, 6)} figure={(item) => (item.rating ? `TMDB ${item.rating.toFixed(1)}` : "New")} genres={genres} index={1} />
              )}
              {comingSoon.length > 0 && (
                <Group title="Coming soon" items={comingSoon.slice(0, 6)} figure={(item) => shortDate(item.releaseDate)} genres={genres} index={2} />
              )}
              {newOnStreaming.length > 0 && (
                <Group title="New on streaming" items={newOnStreaming.slice(0, 6)} figure={(item) => shortDate(item.releaseDate)} genres={genres} index={3} />
              )}
            </>
          )}

          <p className="mt-14 text-center text-sm leading-relaxed text-faint">
            Listings refresh every few hours.
            <br />
            <Link to="/calendar" className="text-ink hover:text-accent">See the full release calendar</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Programme;
