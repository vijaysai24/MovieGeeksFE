import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, Play, Scale, ExternalLink } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { reviewApi } from "../../Services/userService";
import { backdropSrcSet, tmdbImage, profileImage } from "../../Services/images";
import { formatDate, formatLongDate, formatMoney, formatNumber, formatRuntime, plural } from "../../Services/format";
import { useRegion, regionName } from "../../Hooks/useRegion";
import { useTitleActions } from "../../Hooks/useTitleActions";
import { useLanguages } from "../../Hooks/useCatalogReference";
import { TitleActionPanel } from "../Movie/TitleActionPanel";
import { TitleReviews } from "../Movie/Reviews";
import { PosterRow } from "../Movie/PosterRow";
import { Poster } from "../Movie/PosterCard";
import { Button, LinkButton } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { Rail } from "../UI/Rail";
import { SectionHead } from "../UI/Section";
import { Skeleton, SkeletonText } from "../UI/States";
import { Reveal } from "../UI/Reveal";

// Long titles step down so every title stays within two lines.
const titleSize = (title = "") => {
  if (title.length > 40) return "text-[clamp(2rem,1.4rem+2vw,3rem)]";
  if (title.length > 22) return "text-[clamp(2.4rem,1.5rem+3vw,4rem)]";
  return "text-h1";
};

const AVAILABILITY = {
  UPCOMING: (title, region) => ({ label: `Opens ${formatDate(title.releaseInfo.theatrical || title.releaseDate)}`, line: `Not out in ${regionName(region)} yet` }),
  IN_THEATRES: (title, region) => ({ label: "In Cinemas Now", line: `Showing in ${regionName(region)}` }),
  STREAMING: (title) => ({ label: "Streaming Now", line: `On ${[...title.providers.stream, ...title.providers.free, ...title.providers.ads].slice(0, 2).map((p) => p.name).join(" and ")}` }),
  RENT_OR_BUY: () => ({ label: "Rent or Buy", line: "Available digitally" }),
  NOT_AVAILABLE: (title, region) => ({ label: "Not Streaming", line: `No service carries it in ${regionName(region)} yet` }),
};

const STREAM_KINDS = [
  ["stream", "With a subscription"],
  ["free", "Free"],
  ["ads", "Free with ads"],
];

function Hero({ title, region, onTrailer }) {
  const { state, toggleWishlist } = useTitleActions(title);
  const availability = AVAILABILITY[title.availability](title, region);
  const meta = [
    title.year,
    title.mediaType === "tv" ? `${title.tv.numberOfSeasons} ${title.tv.numberOfSeasons === 1 ? "season" : "seasons"}` : formatRuntime(title.runtime),
    title.mediaType === "tv" && title.runtime && `${title.runtime}m episodes`,
    title.releaseInfo.certification,
    title.genres.map((genre) => genre.name).slice(0, 3).join(", "),
  ].filter(Boolean);

  return (
    <section aria-labelledby="title-name">
      <div className="relative h-[46svh] overflow-hidden bg-surface md:h-[72svh] md:min-h-[520px]">
        {title.backdropPath && (
          <img
            src={tmdbImage(title.backdropPath, "w1280")}
            srcSet={backdropSrcSet(title.backdropPath)}
            sizes="100vw"
            alt={`Still from ${title.title}`}
            width="1920"
            height="1080"
            fetchpriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
          />
        )}
        <div className="scrim-bottom absolute inset-0" aria-hidden="true" />
        <div className="scrim-left absolute inset-0 hidden md:block" aria-hidden="true" />
      </div>

      <div className="page relative -mt-28 grid gap-6 md:-mt-64 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="w-32 overflow-hidden rounded-poster shadow-poster md:w-full">
          <Poster path={title.posterPath} title={title.title} eager sizes="(min-width: 768px) 300px, 128px" />
        </div>

        <div className="min-w-0 md:self-end">
          <p className="text-ui">
            <span className="font-medium text-accent">{availability.label}</span>
            <span className="text-muted"> · {availability.line}</span>
          </p>
          <h1 id="title-name" className={`display mt-3 max-w-[18ch] leading-[0.98] text-ink ${titleSize(title.title)}`}>{title.title}</h1>
          {title.tagline && <p className="display mt-4 max-w-[40ch] text-lead text-muted">{title.tagline}</p>}
          <p className="num mt-5 text-ui text-muted">{meta.join(" · ")}</p>
          {title.originalTitle && title.originalTitle !== title.title && (
            <p className="mt-1 text-[15px] text-faint">Original title: <span lang={title.originalLanguage || undefined}>{title.originalTitle}</span></p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {title.trailer && (
              <Button variant="accent" size="lg" onClick={onTrailer}>
                <Play size={18} fill="currentColor" aria-hidden="true" />
                Watch Trailer
              </Button>
            )}
            <Button variant={state.wishlisted ? "primary" : "secondary"} size="lg" onClick={toggleWishlist} aria-pressed={state.wishlisted}>
              <Heart size={18} fill={state.wishlisted ? "currentColor" : "none"} aria-hidden="true" />
              {state.wishlisted ? "On Your Wishlist" : "Wishlist"}
            </Button>
            <LinkButton to={`/compare?a=${title.mediaType}:${title.id}`} variant="ghost" size="lg">
              <Scale size={18} aria-hidden="true" />
              Compare
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhereToWatch({ title, region }) {
  const { providers, releaseInfo } = title;
  const link = providers.link || undefined;
  const streaming = STREAM_KINDS.flatMap(([key, label]) => providers[key].map((provider) => ({ ...provider, label })));
  // Rent and buy usually list the same stores, so each store shows once with what it offers.
  const stores = new Map();
  for (const [key, verb] of [["rent", "Rent"], ["buy", "Buy"]]) {
    for (const provider of providers[key]) {
      const store = stores.get(provider.id) || { ...provider, verbs: [] };
      store.verbs.push(verb);
      stores.set(provider.id, store);
    }
  }
  const shops = [...stores.values()];

  return (
    <section aria-labelledby="watch-title">
      <SectionHead id="watch-title" title="Where to Watch" subtitle={`Availability in ${regionName(region)}, from JustWatch`} />
      {(releaseInfo.theatrical || releaseInfo.digital) && (
        <p className="num -mt-2 mb-6 text-[15px] text-muted">
          {[releaseInfo.theatrical && `In cinemas from ${formatLongDate(releaseInfo.theatrical)}`, releaseInfo.digital && `on digital from ${formatLongDate(releaseInfo.digital)}`].filter(Boolean).join(", ")}
        </p>
      )}

      {streaming.length > 0 && (
        <div>
          <h3 className="text-ui font-medium text-ink">Stream</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {streaming.map((provider) => (
              <li key={`${provider.label}:${provider.id}`}>
                <a href={link} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-panel bg-surface p-3.5 transition-colors can-hover:hover:bg-raised">
                  <img src={tmdbImage(provider.logoPath, "w154")} alt="" width="48" height="48" loading="lazy" className="h-12 w-12 flex-none rounded-[11px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">{provider.name}</span>
                    <span className="block text-[13px] text-faint">{provider.label}</span>
                  </span>
                  <ExternalLink size={15} className="flex-none text-faint transition-colors can-hover:group-hover:text-ink" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shops.length > 0 && (
        <div className={streaming.length ? "mt-8" : ""}>
          <h3 className="text-ui font-medium text-ink">Rent or Buy</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {shops.map((store) => (
              <li key={store.id}>
                <a href={link} target="_blank" rel="noreferrer" className="flex h-11 items-center gap-2.5 rounded-full bg-surface pl-1.5 pr-4 transition-colors can-hover:hover:bg-raised">
                  <img src={tmdbImage(store.logoPath, "w92")} alt="" width="32" height="32" loading="lazy" className="h-8 w-8 rounded-full" />
                  <span className="text-[14px] text-ink">{store.name}</span>
                  <span className="text-[13px] text-faint">{store.verbs.join(" · ")}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!streaming.length && !shops.length && (
        <p className="rounded-panel bg-surface p-5 text-[15px] text-muted">
          {title.availability === "UPCOMING"
            ? "It isn't out yet. Set an alert in Your Take and we'll tell you when it is."
            : `No service carries it in ${regionName(region)} right now. Set an alert in Your Take to hear when one does.`}
        </p>
      )}
    </section>
  );
}

function Cast({ title }) {
  const { crew } = title;
  const lines = [
    [title.mediaType === "tv" ? "Created by" : "Directed by", title.mediaType === "tv" ? crew.creators : crew.directors],
    title.mediaType === "tv" && ["Directed by", crew.directors],
    ["Written by", crew.writers],
    ["Music", crew.music],
    ["Photography", crew.cinematography],
    ["Produced by", crew.producers.slice(0, 4)],
  ].filter((line) => line && line[1]?.length);

  const crewList = lines.length > 0 && (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {lines.map(([label, people]) => (
        <div key={label}>
          <dt className="text-[13px] text-faint">{label}</dt>
          <dd className="mt-1 text-[15px] text-ink">
            {people.map((person, index) => (
              <span key={`${person.id}-${index}`}>
                {index > 0 && ", "}
                <Link to={`/person/${person.id}`} className="can-hover:hover:text-accent">{person.name}</Link>
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );

  if (!title.cast.length) {
    return crewList && (
      <section aria-labelledby="cast-title">
        <SectionHead id="cast-title" title="Crew" />
        {crewList}
      </section>
    );
  }

  return (
    <div>
      <Rail id="cast-title" title="Cast and Crew" count={title.cast.length}>
        {title.cast.map((person) => (
          <Link key={person.id} to={`/person/${person.id}`} className="group block w-[120px] flex-none snap-start md:w-[136px]">
            <span className="block overflow-hidden rounded-poster bg-raised">
              {person.profilePath ? (
                <img src={profileImage(person.profilePath, "w185")} alt="" width="136" height="204" loading="lazy" className="aspect-[2/3] w-full object-cover transition-transform duration-500 can-hover:group-hover:scale-[1.05]" />
              ) : (
                <span className="flex aspect-[2/3] w-full items-end p-3"><span className="display text-xl leading-tight text-muted">{person.name}</span></span>
              )}
            </span>
            <span className="mt-2 block truncate text-[15px] font-medium text-ink can-hover:group-hover:text-accent">{person.name}</span>
            <span className="block truncate text-[13px] text-faint">{person.character || " "}</span>
          </Link>
        ))}
      </Rail>
      {crewList && <div className="mt-6">{crewList}</div>}
    </div>
  );
}

function Videos({ title, onPlay }) {
  if (title.videos.length < 2) return null;
  return (
    <Rail id="videos-title" title="Trailers and Clips" count={title.videos.length}>
      {title.videos.map((video) => (
        <button key={video.key} type="button" onClick={() => onPlay(video)} className="group block w-[260px] flex-none snap-start text-left md:w-[300px]">
          <span className="relative block overflow-hidden rounded-poster bg-raised">
            <img src={`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`} alt="" width="300" height="169" loading="lazy" className="aspect-video w-full object-cover transition-transform duration-500 can-hover:group-hover:scale-[1.04]" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-ink ring-1 ring-inset ring-white/20 transition-transform can-hover:group-hover:scale-110">
                <Play size={18} fill="currentColor" aria-hidden="true" />
              </span>
            </span>
          </span>
          <span className="mt-2 block truncate text-[15px] text-ink">{video.name}</span>
          <span className="block text-[13px] text-faint">{video.type}{video.official ? " · Official" : ""}</span>
        </button>
      ))}
    </Rail>
  );
}

function Seasons({ tv }) {
  if (!tv?.seasons.length) return null;
  return (
    <Rail id="seasons-title" title="Seasons" count={tv.seasons.length}>
      {tv.seasons.map((season) => (
        <div key={season.seasonNumber} className="w-[136px] flex-none snap-start">
          <div className="overflow-hidden rounded-poster bg-raised">
            <Poster path={season.posterPath} title={season.name} sizes="136px" />
          </div>
          <p className="mt-2 truncate text-[15px] font-medium text-ink">{season.name}</p>
          <p className="num text-[13px] text-faint">{plural(season.episodeCount, "episode")} · {season.airDate ? season.airDate.slice(0, 4) : "TBA"}</p>
        </div>
      ))}
    </Rail>
  );
}

function Ratings({ title }) {
  const { data: community, isLoading } = useQuery({
    queryKey: ["community", title.mediaType, title.id],
    queryFn: () => reviewApi.community(title.mediaType, title.id),
  });
  const max = Math.max(1, ...(community?.distribution || []).map((bin) => bin.count));
  const external = title.externalRatings;
  const outside = [
    ["TMDB", external.tmdb && `${external.tmdb.score.toFixed(1)}`, "/10", external.tmdb && `${formatNumber(external.tmdb.votes)} votes`],
    ["IMDb", external.imdb && `${external.imdb.score.toFixed(1)}`, "/10", external.imdb?.votes && `${formatNumber(external.imdb.votes)} votes`],
    ["Rotten Tomatoes", external.rottenTomatoes && `${external.rottenTomatoes}`, "%", "Critics"],
    ["Metacritic", external.metacritic && `${external.metacritic}`, "/100", "Critics"],
  ].filter(([, value]) => value);

  return (
    <section aria-labelledby="ratings-title" className="rounded-panel bg-surface p-5 md:p-6">
      <h2 id="ratings-title" className="text-h3 font-semibold text-ink">Ratings</h2>

      <div className="mt-5 rounded-control bg-raised p-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : community?.ratingCount ? (
          <>
            <p className="num">
              <span className="text-[2.25rem] font-semibold leading-none text-accent">{community.averageRating.toFixed(1)}</span>
              <span className="text-ui text-faint"> /10</span>
            </p>
            <h3 className="mt-1 text-[15px] font-medium text-ink">
              <span translate="no">Cinefile</span> members <span className="num font-normal text-faint">· {plural(community.ratingCount, "rating")}</span>
            </h3>
            <div className="mt-4 flex h-14 items-end gap-1" role="img" aria-label={`Rating spread: ${community.distribution.map((bin) => `${bin.count} gave ${bin.rating}`).join(", ")}`}>
              {community.distribution.map((bin) => (
                <div key={bin.rating} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-[2px] bg-accent" style={{ height: `${Math.max(bin.count ? 3 : 0, (bin.count / max) * 36)}px` }} />
                  <span className="num text-[12px] text-faint">{bin.rating}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-[15px] font-medium text-ink"><span translate="no">Cinefile</span> members</h3>
            <p className="mt-1 text-[15px] text-muted">No member has rated it yet. Yours would be the first.</p>
          </>
        )}
      </div>

      {community && (community.watchedCount > 0 || community.wishlistCount > 0) && (
        <p className="num mt-3 text-[13px] text-faint">
          {[community.watchedCount > 0 && `Watched by ${plural(community.watchedCount, "member")}`, community.wishlistCount > 0 && `on ${plural(community.wishlistCount, "wishlist")}`].filter(Boolean).join(", ")}
        </p>
      )}

      {outside.length > 0 ? (
        <dl className="num mt-4 grid grid-cols-2 gap-3">
          {outside.map(([source, value, unit, detail]) => (
            <div key={source} className="rounded-control bg-raised p-3.5">
              <dt className="text-[13px] text-faint">{source}</dt>
              <dd className="mt-1">
                <span className="text-xl font-semibold text-ink">{value}</span>
                <span className="text-[13px] text-faint">{unit}</span>
                <span className="block text-[12px] text-faint">{detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-[15px] text-muted">No outside scores yet.</p>
      )}
    </section>
  );
}

function Facts({ title, region }) {
  const { data: languages = [] } = useLanguages();
  const language = languages.find((item) => item.code === title.originalLanguage)?.name || title.originalLanguage?.toUpperCase();
  const tv = title.tv;
  const rows = [
    ["Released", title.releaseDate && formatLongDate(title.releaseDate)],
    tv && ["Last aired", tv.lastAirDate && formatLongDate(tv.lastAirDate)],
    tv?.nextEpisode && ["Next episode", `S${tv.nextEpisode.seasonNumber} E${tv.nextEpisode.episodeNumber}, ${formatLongDate(tv.nextEpisode.airDate)}`],
    tv && ["Episodes", `${formatNumber(tv.numberOfEpisodes)} across ${tv.numberOfSeasons} seasons`],
    tv && ["Network", tv.networks.map((network) => network.name).join(", ")],
    ["Status", title.status],
    ["Original language", language],
    ["Spoken", title.languages.join(", ")],
    ["Countries", title.countries.join(", ")],
    ["Budget", formatMoney(title.budget)],
    ["Box office", formatMoney(title.revenue)],
    ["Certificate", title.releaseInfo.certification && `${title.releaseInfo.certification} in ${regionName(region)}`],
  ].filter((row) => row && row[1]);

  return (
    <section aria-labelledby="facts-title" className="rounded-panel bg-surface p-5 md:p-6">
      <h2 id="facts-title" className="text-h3 font-semibold text-ink">Details</h2>
      <dl className="num mt-4 divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 py-2.5">
            <dt className="flex-none text-[14px] text-faint">{label}</dt>
            <dd className="text-right text-[14px] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TitleSkeleton() {
  return (
    <div aria-busy="true">
      <Skeleton className="h-[46svh] w-full rounded-none md:h-[72svh]" />
      <div className="page -mt-24 grid gap-8 md:grid-cols-[260px_1fr]">
        <Skeleton className="aspect-[2/3] w-32 rounded-poster md:w-full" />
        <div className="self-end">
          <Skeleton className="h-16 w-3/4" />
          <SkeletonText className="mt-6" lines={2} />
        </div>
      </div>
    </div>
  );
}

function TitleDetails({ mediaType }) {
  const { id } = useParams();
  const { region } = useRegion();
  const [video, setVideo] = useState(null);

  const { data: title, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["catalog", "title", mediaType, Number(id), region],
    queryFn: () => catalogApi.details(mediaType, id, region),
    staleTime: 10 * 60 * 1000,
  });

  const viewer = useTitleActions(title || { mediaType, id: Number(id) });

  useEffect(() => {
    if (title) document.title = `${title.title}${title.year ? ` (${title.year})` : ""} · Cinefile`;
    return () => {
      document.title = "Cinefile";
    };
  }, [title]);

  if (isLoading) return <TitleSkeleton />;

  if (isError) {
    const notFound = error?.response?.status === 404;
    return (
      <div className="page pb-10 pt-32">
        <h1 className="display text-h1">{notFound ? "We couldn't find that title" : "This page didn't load"}</h1>
        <p className="mt-4 max-w-md text-read text-muted">{notFound ? "It may have been removed from TMDB, or the link is wrong." : "The film archive is slow to answer. Try again in a moment."}</p>
        <div className="mt-8 flex gap-3">
          {!notFound && <Button variant="primary" onClick={() => refetch()}>Try Again</Button>}
          <LinkButton to="/discover" variant="secondary">Browse Films</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero title={title} region={region} onTrailer={() => setVideo(title.trailer)} />

      {/* Wide screens keep the side panels in one sticky column. On phones that column dissolves
          (display: contents) so the panels can sit where they help: your take and ratings after
          the story, details at the very end. */}
      <div className="page mt-14 flex flex-col gap-14 lg:mt-20 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-20">
        <Reveal as="section" aria-labelledby="story-title" className="order-1 lg:col-start-1 lg:row-start-1">
          <h2 id="story-title" className="display text-[clamp(1.75rem,1.3rem+1.3vw,2.375rem)] text-ink">Story</h2>
          <p className="mt-4 max-w-[68ch] text-read text-ink">{title.overview || "TMDB has no synopsis for this title yet."}</p>
        </Reveal>

        <aside className="contents lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
          <div className="contents lg:sticky lg:top-24 lg:block lg:space-y-4">
            <div className="order-2"><TitleActionPanel title={title} /></div>
            <div className="order-3 max-lg:-mt-10"><Ratings title={title} /></div>
            <div className="order-5"><Facts title={title} region={region} /></div>
          </div>
        </aside>

        <div className="order-4 min-w-0 space-y-16 lg:col-start-1 lg:row-start-2 lg:space-y-20">
          <WhereToWatch title={title} region={region} />
          <Cast title={title} />
          <Videos title={title} onPlay={setVideo} />
          <Seasons tv={title.tv} />
          <TitleReviews title={title} viewerState={viewer.state} />
        </div>
      </div>

      <div className="section-gap space-y-20">
        <PosterRow className="page" title="If You Liked This" items={title.recommendations} />
        <PosterRow className="page" title={`More Like ${title.title}`} items={title.similar} />
      </div>

      <Dialog open={Boolean(video)} onClose={() => setVideo(null)} title={video?.name || "Trailer"} size="lg" bare>
        <div className="aspect-video w-full bg-black">
          {video && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1&rel=0`}
              title={video.name}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              className="h-full w-full"
            />
          )}
        </div>
      </Dialog>
    </>
  );
}

export default TitleDetails;
