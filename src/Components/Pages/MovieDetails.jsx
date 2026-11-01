import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Play, Scale } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { reviewApi } from "../../Services/userService";
import { tmdbImage, profileImage } from "../../Services/images";
import { formatDate, formatLongDate, formatMoney, formatNumber, formatRuntime, plural } from "../../Services/format";
import { useRegion, regionName } from "../../Hooks/useRegion";
import { useTitleActions } from "../../Hooks/useTitleActions";
import { useLanguages } from "../../Hooks/useCatalogReference";
import { TitleStage, useStageSection } from "../Movie/TitleStage";
import { TitleActionPanel } from "../Movie/TitleActionPanel";
import { TitleReviews } from "../Movie/Reviews";
import { PosterRow } from "../Movie/PosterRow";
import { Button, LinkButton } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { Skeleton, SkeletonText } from "../UI/States";
import { Reveal } from "../UI/Reveal";

// Long titles step down a size so every title stays on two lines.
const titleSize = (title = "") => {
  if (title.length > 40) return "text-[clamp(2rem,2.6vw,2.5rem)]";
  if (title.length > 22) return "text-[clamp(2.4rem,3.4vw,3.25rem)]";
  return "text-[clamp(2.75rem,4.6vw,4.25rem)]";
};

const AVAILABILITY = {
  UPCOMING: (title, region) => `Releases in ${regionName(region)} on ${formatLongDate(title.releaseInfo.theatrical || title.releaseDate)}`,
  IN_THEATRES: (title, region) => `In cinemas in ${regionName(region)} now`,
  STREAMING: (title) => `Streaming on ${[...title.providers.stream, ...title.providers.free, ...title.providers.ads].slice(0, 2).map((p) => p.name).join(" and ")}`,
  RENT_OR_BUY: () => "Available to rent or buy",
  NOT_AVAILABLE: (title, region) => `Not streaming in ${regionName(region)} yet`,
};

function SectionHeading({ id, children }) {
  return <h2 id={id} className="display text-[clamp(2rem,2.6vw,2.5rem)] text-ink">{children}</h2>;
}

function ProviderGroup({ label, providers }) {
  if (!providers.length) return null;
  return (
    <div>
      <h3 className="text-sm text-faint">{label}</h3>
      <ul className="mt-3 flex flex-wrap gap-3">
        {providers.map((provider) => (
          <li key={provider.id} className="flex items-center gap-2.5 rounded-full bg-surface py-1 pl-1 pr-4">
            <img src={tmdbImage(provider.logoPath, "w92")} alt="" width="32" height="32" loading="lazy" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-sm text-ink">{provider.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhereToWatch({ title, region }) {
  const { providers, releaseInfo } = title;
  const any = providers.stream.length + providers.free.length + providers.ads.length + providers.rent.length + providers.buy.length > 0;

  return (
    <section aria-labelledby="watch-title" data-stage="backdrop" className="mt-[clamp(112px,9vw,136px)]">
      <Reveal><SectionHeading id="watch-title">Where to watch</SectionHeading></Reveal>
      <Reveal index={1}>
        <p className="mt-3 text-lg text-ink">{AVAILABILITY[title.availability](title, region)}</p>
        {(releaseInfo.theatrical || releaseInfo.digital) && (
          <p className="num mt-1 text-[15px] text-muted">
            {[releaseInfo.theatrical && `In cinemas from ${formatDate(releaseInfo.theatrical)}`, releaseInfo.digital && `on digital from ${formatDate(releaseInfo.digital)}`]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </Reveal>
      <Reveal index={2} className="mt-8 space-y-7">
        <ProviderGroup label="Stream" providers={[...providers.stream, ...providers.free, ...providers.ads]} />
        <ProviderGroup label="Rent" providers={providers.rent} />
        <ProviderGroup label="Buy" providers={providers.buy} />
        {!any && title.availability !== "UPCOMING" && (
          <p className="text-[15px] text-muted">No service carries it in {regionName(region)} right now. Add it to your wishlist and check back.</p>
        )}
        {providers.link && (
          <p className="text-[13px] text-faint">
            Availability from JustWatch.{" "}
            <a href={providers.link} target="_blank" rel="noreferrer" className="text-muted underline-offset-4 hover:text-ink hover:underline">See all options</a>
          </p>
        )}
      </Reveal>
    </section>
  );
}

function Ratings({ title }) {
  const { data: community, isLoading } = useQuery({
    queryKey: ["community", title.mediaType, title.id],
    queryFn: () => reviewApi.community(title.mediaType, title.id),
  });
  const max = Math.max(1, ...(community?.distribution || []).map((bin) => bin.count));
  const external = title.externalRatings;

  return (
    <section aria-labelledby="ratings-title" data-stage="poster" className="mt-[clamp(112px,9vw,136px)]">
      <Reveal><SectionHeading id="ratings-title">Ratings</SectionHeading></Reveal>
      <div className="mt-8 grid gap-10 sm:grid-cols-[1.25fr_1fr]">
        <Reveal index={1}>
          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : community.ratingCount ? (
            <>
              <p className="num">
                <span className="text-[2.25rem] font-semibold leading-none text-accent">{community.averageRating.toFixed(1)}</span>
                <span className="text-base text-faint"> /10</span>
              </p>
              <h3 className="mt-1 text-lg font-medium text-ink">
                Movie Geeks members <span className="num text-base font-normal text-faint">· {plural(community.ratingCount, "rating")}</span>
              </h3>
              <div className="mt-5 flex h-20 items-end gap-1" role="img" aria-label={`Rating spread: ${community.distribution.map((bin) => `${bin.count} gave ${bin.rating}`).join(", ")}`}>
                {community.distribution.map((bin) => (
                  <div key={bin.rating} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="w-full rounded-t-[2px] bg-accent" style={{ height: `${Math.max(bin.count ? 4 : 0, (bin.count / max) * 64)}px` }} />
                    <span className="num text-[13px] text-faint">{bin.rating}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-ink">Movie Geeks members</h3>
              <p className="mt-2 text-base text-muted">No member has rated it yet. Yours would be the first.</p>
            </>
          )}
          {community && (community.watchedCount > 0 || community.wishlistCount > 0) && (
            <p className="num mt-4 text-[13px] text-faint">
              {[community.watchedCount && `Watched by ${plural(community.watchedCount, "member")}`, community.wishlistCount && `on ${plural(community.wishlistCount, "wishlist")}`].filter(Boolean).join(", ")}
            </p>
          )}
        </Reveal>

        <Reveal index={2}>
          <h3 className="text-lg font-medium text-ink">Elsewhere</h3>
          <dl className="num mt-3 space-y-3">
            {[
              ["TMDB", external.tmdb && `${external.tmdb.score.toFixed(1)} /10`, external.tmdb && `${formatNumber(external.tmdb.votes)} votes`],
              ["IMDb", external.imdb && `${external.imdb.score.toFixed(1)} /10`, external.imdb?.votes && `${formatNumber(external.imdb.votes)} votes`],
              ["Rotten Tomatoes", external.rottenTomatoes && `${external.rottenTomatoes}%`, "critics"],
              ["Metacritic", external.metacritic && `${external.metacritic} /100`, "critics"],
            ]
              .filter(([, value]) => value)
              .map(([source, value, detail]) => (
                <div key={source} className="flex items-baseline justify-between gap-4">
                  <dt className="text-[15px] text-muted">{source}</dt>
                  <dd className="text-right">
                    <span className="text-[17px] text-ink">{value}</span>
                    <span className="block text-[13px] text-faint">{detail}</span>
                  </dd>
                </div>
              ))}
          </dl>
          {!external.tmdb && !external.imdb && <p className="text-[15px] text-muted">No outside scores yet.</p>}
        </Reveal>
      </div>
    </section>
  );
}

function PeopleLine({ label, people }) {
  if (!people?.length) return null;
  return (
    <div className="flex gap-6 py-2">
      <dt className="w-28 flex-none text-[15px] text-faint">{label}</dt>
      <dd className="text-[15px] text-ink">
        {people.map((person, index) => (
          <span key={`${person.id}-${index}`}>
            {index > 0 && ", "}
            <Link to={`/person/${person.id}`} className="hover:text-accent">{person.name}</Link>
          </span>
        ))}
      </dd>
    </div>
  );
}

function Credits({ title }) {
  const [showAll, setShowAll] = useState(false);
  const cast = showAll ? title.cast : title.cast.slice(0, 10);
  const { crew } = title;

  return (
    <section aria-labelledby="credits-title" data-stage="cast" className="mt-[clamp(112px,9vw,136px)]">
      <Reveal><SectionHeading id="credits-title">Cast and crew</SectionHeading></Reveal>
      <Reveal index={1}>
        <dl className="mt-6">
          <PeopleLine label={title.mediaType === "tv" ? "Created by" : "Directed by"} people={title.mediaType === "tv" ? crew.creators : crew.directors} />
          {title.mediaType === "tv" && <PeopleLine label="Directed by" people={crew.directors} />}
          <PeopleLine label="Written by" people={crew.writers} />
          <PeopleLine label="Produced by" people={crew.producers.slice(0, 4)} />
          <PeopleLine label="Music" people={crew.music} />
          <PeopleLine label="Photography" people={crew.cinematography} />
        </dl>
      </Reveal>
      {title.cast.length > 0 && (
        <Reveal index={2}>
          <ul className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {cast.map((person) => (
              <li key={person.id}>
                <Link to={`/person/${person.id}`} className="group flex items-center gap-3">
                  {person.profilePath ? (
                    <img src={profileImage(person.profilePath, "w185")} alt="" width="48" height="48" loading="lazy" className="h-12 w-12 flex-none rounded-full bg-raised object-cover" />
                  ) : (
                    <span className="h-12 w-12 flex-none rounded-full bg-raised" aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] text-ink group-hover:text-accent">{person.name}</span>
                    <span className="block truncate text-[13px] text-faint">{person.character || " "}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {title.cast.length > 10 && (
            <Button variant="ghost" size="sm" onClick={() => setShowAll((value) => !value)} className="mt-4 -ml-3.5">
              {showAll ? "Show fewer" : `Show all ${title.cast.length} cast`}
            </Button>
          )}
        </Reveal>
      )}
    </section>
  );
}

function Details({ title, region }) {
  const { data: languages = [] } = useLanguages();
  const language = languages.find((item) => item.code === title.originalLanguage)?.name || title.originalLanguage?.toUpperCase();
  const tv = title.tv;

  const rows = [
    ["Released", title.releaseDate && formatLongDate(title.releaseDate)],
    tv && ["Last aired", tv.lastAirDate && formatLongDate(tv.lastAirDate)],
    tv?.nextEpisode && ["Next episode", `S${tv.nextEpisode.seasonNumber} E${tv.nextEpisode.episodeNumber} on ${formatLongDate(tv.nextEpisode.airDate)}`],
    tv && ["Seasons", `${tv.numberOfSeasons} seasons, ${formatNumber(tv.numberOfEpisodes)} episodes`],
    tv && ["Network", tv.networks.map((network) => network.name).join(", ")],
    ["Status", title.status],
    ["Language", language],
    ["Spoken", title.languages.join(", ")],
    ["Countries", title.countries.join(", ")],
    ["Budget", formatMoney(title.budget)],
    ["Box office", formatMoney(title.revenue)],
    ["Certificate", title.releaseInfo.certification && `${title.releaseInfo.certification} in ${regionName(region)}`],
  ].filter((row) => row && row[1]);

  return (
    <section aria-labelledby="details-title" data-stage="backdrop" className="mt-[clamp(112px,9vw,136px)]">
      <Reveal><SectionHeading id="details-title">Details</SectionHeading></Reveal>
      <Reveal index={1}>
        <dl className="num mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[13px] text-faint">{label}</dt>
              <dd className="mt-0.5 text-[15px] text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
      {tv?.seasons.length > 0 && (
        <Reveal index={2}>
          <h3 className="mt-10 text-sm text-faint">Seasons</h3>
          <ul className="mt-3 space-y-3">
            {tv.seasons.map((season) => (
              <li key={season.seasonNumber} className="flex items-center gap-4">
                {season.posterPath ? (
                  <img src={tmdbImage(season.posterPath, "w92")} alt="" width="40" height="60" loading="lazy" className="h-[60px] w-10 flex-none rounded-[3px] bg-raised object-cover" />
                ) : (
                  <span className="h-[60px] w-10 flex-none rounded-[3px] bg-raised" aria-hidden="true" />
                )}
                <span className="flex-1 text-[15px] text-ink">{season.name}</span>
                <span className="num text-right text-[13px] text-faint">
                  {season.episodeCount} episodes
                  <span className="block">{season.airDate ? season.airDate.slice(0, 4) : "TBA"}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  );
}

function TitleSkeleton() {
  return (
    <div className="md:grid md:grid-cols-[45fr_55fr]">
      <Skeleton className="h-[60svh] w-full rounded-none md:h-[calc(100svh-64px)]" />
      <div className="bg-paper px-5 py-12 md:px-14">
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <Skeleton className="mt-10 h-36 w-full rounded-lg" />
        <SkeletonText className="mt-10" lines={4} />
      </div>
    </div>
  );
}

function TitleDetails({ mediaType }) {
  const { id } = useParams();
  const { region } = useRegion();
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { data: title, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["catalog", "title", mediaType, Number(id), region],
    queryFn: () => catalogApi.details(mediaType, id, region),
    staleTime: 10 * 60 * 1000,
  });

  // Loaded alongside the title so the actions and the reviews block share one cached state.
  const viewer = useTitleActions(title || { mediaType, id: Number(id) });
  const stage = useStageSection(Boolean(title));

  useEffect(() => {
    if (title) document.title = `${title.title}${title.year ? ` (${title.year})` : ""} · Movie Geeks`;
    return () => {
      document.title = "Movie Geeks";
    };
  }, [title]);

  if (isLoading) return <TitleSkeleton />;

  if (isError) {
    const notFound = error?.response?.status === 404;
    return (
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8">
        <h1 className="display text-5xl">{notFound ? "We couldn't find that title" : "This page didn't load"}</h1>
        <p className="mt-4 max-w-md text-muted">{notFound ? "It may have been removed from TMDB, or the link is wrong." : "The film archive is slow to answer right now."}</p>
        <div className="mt-8 flex gap-3">
          {!notFound && <Button variant="primary" onClick={() => refetch()}>Try again</Button>}
          <LinkButton to="/discover" variant="secondary">Browse instead</LinkButton>
        </div>
      </div>
    );
  }

  const lead = title.cast.find((person) => person.profilePath);
  const images = {
    backdrop: { kind: "backdrop", path: title.backdropPath, alt: `Still from ${title.title}` },
    poster: { kind: "poster", path: title.posterPath, alt: `${title.title} poster` },
    cast: lead ? { kind: "person", path: lead.profilePath, alt: `${lead.name}, who plays ${lead.character || "a lead role"}` } : null,
  };

  const meta = [
    title.year,
    title.mediaType === "tv" ? "Series" : formatRuntime(title.runtime),
    title.mediaType === "tv" && title.runtime && `${title.runtime}m episodes`,
    title.releaseInfo.certification,
  ].filter(Boolean);

  return (
    <>
      <div className="md:grid md:grid-cols-[45fr_55fr]">
        <div className="sticky top-14 h-[60svh] md:top-16 md:h-[calc(100svh-64px)]">
          <TitleStage images={images} stage={stage} title={title.title} />
        </div>

        <article className="relative z-10 -mt-[10svh] bg-paper px-5 pb-20 pt-10 md:mt-0 md:px-14 md:pt-16 lg:px-[72px]">
          <div className="max-w-[620px]">
            <header data-stage="backdrop">
              {/* The first screen's title never waits on an animation. */}
              <h1 className={`display max-w-[16ch] text-ink ${titleSize(title.title)}`}>{title.title}</h1>
              {title.tagline && <p className="display mt-5 max-w-[32ch] text-[clamp(1.5rem,1.2rem+0.8vw,1.875rem)] leading-[1.15] text-ink">{title.tagline}</p>}
              <p className="num mt-6 text-base text-muted">
                {[...meta, title.genres.map((genre) => genre.name).join(", ")].filter(Boolean).join(" · ")}
              </p>
              {title.originalTitle && title.originalTitle !== title.title && (
                <p className="mt-1 text-base text-faint">Original title: {title.originalTitle}</p>
              )}
              <Reveal index={2} className="mt-8 flex flex-wrap gap-3">
                {title.trailer && (
                  <Button variant="accent" size="lg" onClick={() => setTrailerOpen(true)}>
                    <Play size={18} fill="currentColor" aria-hidden="true" />
                    Play trailer
                  </Button>
                )}
                <LinkButton to={`/compare?a=${title.mediaType}:${title.id}`} variant="secondary" size="lg">
                  <Scale size={18} aria-hidden="true" />
                  Compare
                </LinkButton>
              </Reveal>
              <Reveal index={3} className="mt-8">
                <TitleActionPanel title={title} />
              </Reveal>
            </header>

            <section aria-labelledby="story-title" data-stage="backdrop" className="mt-[clamp(112px,9vw,136px)]">
              <Reveal><SectionHeading id="story-title">Story</SectionHeading></Reveal>
              <Reveal index={1}>
                <p className="mt-5 text-[17px] leading-[1.65] text-ink">{title.overview || "TMDB has no synopsis for this title yet."}</p>
              </Reveal>
            </section>

            <WhereToWatch title={title} region={region} />
            <Ratings title={title} />
            <Credits title={title} />
            <Details title={title} region={region} />

            <div data-stage="poster" className="mt-[clamp(112px,9vw,136px)]">
              <TitleReviews title={title} viewerState={viewer.state} />
            </div>
          </div>
        </article>
      </div>

      <div className="mx-auto mt-[clamp(96px,10vw,160px)] max-w-[1440px] space-y-14 px-4 md:px-8">
        <PosterRow title="If you liked this" items={title.recommendations} />
        <PosterRow title={`More like ${title.title}`} items={title.similar} />
      </div>

      {title.trailer && (
        <Dialog open={trailerOpen} onClose={() => setTrailerOpen(false)} title={title.trailer.name} size="lg" bare>
          <div className="aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${title.trailer.key}?autoplay=1&rel=0`}
              title={title.trailer.name}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              className="h-full w-full"
            />
          </div>
        </Dialog>
      )}
    </>
  );
}

export default TitleDetails;
