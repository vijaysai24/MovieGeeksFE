import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { backdropSrcSet, posterSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { genreNames, useGenres, useLanguages, COMMON_LANGUAGES } from "../../Hooks/useCatalogReference";
import { titleKey, useLibraryKeys, useQuickWishlist } from "../../Hooks/useLibraryKeys";
import { Button } from "../UI/Button";
import { Skeleton } from "../UI/States";
import { Reveal } from "../UI/Reveal";

const DECADES = [
  ["", "any decade"],
  ["2020", "the 2020s"],
  ["2010", "the 2010s"],
  ["2000", "the 2000s"],
  ["1990", "the 1990s"],
  ["1980", "the 1980s"],
  ["1970", "the 1970s"],
  ["1950", "before 1970"],
];

const RATINGS = [["", "anything"], ["6", "6 or more"], ["7", "7 or more"], ["8", "8 or more"]];

// A select that reads as a word in the sentence it sits in.
function InlineSelect({ label, value, onChange, children }) {
  return (
    <span className="relative inline-block align-baseline">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer appearance-none rounded-full bg-raised py-0.5 pl-3.5 pr-8 text-accent transition-colors can-hover:hover:bg-nested focus:outline-none focus-visible:outline-2"
      >
        {children}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-accent" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </span>
  );
}

const decadeRange = (decade) => {
  if (!decade) return {};
  if (decade === "1950") return { yearTo: 1969 };
  return { yearFrom: Number(decade), yearTo: Number(decade) + 9 };
};

// The live part of the home page: say what you are in the mood for, get one real film back.
// Members never get something they have already seen or saved.
function TonightsPick({ region }) {
  const { data: genres = [] } = useGenres();
  const { data: languages = [] } = useLanguages();
  const keys = useLibraryKeys();
  const toggleWishlist = useQuickWishlist();
  const [mediaType, setMediaType] = useState("movie");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [decade, setDecade] = useState("");
  const [ratingMin, setRatingMin] = useState("7");
  const [spin, setSpin] = useState(0);

  const filters = { mediaType, genres: genre ? [Number(genre)] : [], language, ratingMin, region, ...decadeRange(decade) };

  const { data: pick, isFetching, isError, refetch } = useQuery({
    queryKey: ["catalog", "random", filters, spin],
    queryFn: () => catalogApi.random({ ...filters, seed: spin }),
    staleTime: Infinity,
    placeholderData: (previous) => previous,
  });

  const genreOptions = genres.filter((item) => item.mediaTypes.includes(mediaType));
  const languageOptions = COMMON_LANGUAGES.map((code) => languages.find((item) => item.code === code)).filter(Boolean);
  const wishlisted = pick ? keys.wishlist.has(titleKey(pick)) : false;

  return (
    <section id="tonight" className="page section-gap" aria-labelledby="pick-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Reveal>
            <h2 id="pick-title" className="display text-h2 text-ink">Tonight&rsquo;s Pick</h2>
          </Reveal>
          <Reveal index={1}>
            <p className="mt-8 max-w-[30ch] text-[clamp(1.25rem,1rem+0.8vw,1.625rem)] leading-[1.9] text-ink">
              Find me{" "}
              <InlineSelect label="Genre" value={genre} onChange={setGenre}>
                <option value="">anything good</option>
                {genreOptions.map((item) => <option key={item.id} value={item.id}>{item.name.toLowerCase()}</option>)}
              </InlineSelect>{" "}
              as a{" "}
              <InlineSelect label="Film or series" value={mediaType} onChange={(value) => { setMediaType(value); setGenre(""); }}>
                <option value="movie">film</option>
                <option value="tv">series</option>
              </InlineSelect>
              , in{" "}
              <InlineSelect label="Language" value={language} onChange={setLanguage}>
                <option value="">any language</option>
                {languageOptions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
              </InlineSelect>
              , from{" "}
              <InlineSelect label="Decade" value={decade} onChange={setDecade}>
                {DECADES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </InlineSelect>
              , rated{" "}
              <InlineSelect label="Minimum TMDB rating" value={ratingMin} onChange={setRatingMin}>
                {RATINGS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </InlineSelect>
              .
            </p>
            <Button variant="outline" className="mt-8" onClick={() => setSpin((value) => value + 1)} disabled={isFetching}>
              <Shuffle size={16} aria-hidden="true" />
              {isFetching ? "Looking…" : "Show Me Another"}
            </Button>
          </Reveal>
        </div>

        <div className="lg:col-span-7" aria-live="polite">
          {isError && (
            <p className="text-read text-muted">
              The film archive didn&rsquo;t answer.{" "}
              <button type="button" onClick={() => refetch()} className="font-medium text-ink underline underline-offset-4">Try Again</button>
            </p>
          )}
          {!isError && pick === undefined && <Skeleton className="aspect-[16/10] w-full rounded-panel" />}
          {!isError && pick === null && (
            <p className="text-read text-muted">Nothing matches all of that. Loosen one of the words in the sentence.</p>
          )}
          {pick && (
            <article className="relative overflow-hidden rounded-panel bg-surface">
              {pick.backdropPath && (
                <div className="relative aspect-[16/8]">
                  <img
                    src={tmdbImage(pick.backdropPath, "w1280")}
                    srcSet={backdropSrcSet(pick.backdropPath)}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    alt=""
                    width="1280"
                    height="640"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="scrim-bottom absolute inset-0" aria-hidden="true" />
                </div>
              )}
              <div className={`relative flex gap-5 p-5 md:p-7 ${pick.backdropPath ? "-mt-24" : ""}`}>
                <Link to={titleHref(pick)} className="w-24 flex-none overflow-hidden rounded-poster shadow-poster md:w-32">
                  <img
                    src={tmdbImage(pick.posterPath, "w342")}
                    srcSet={posterSrcSet(pick.posterPath)}
                    sizes="128px"
                    alt={`${pick.title} poster`}
                    width="128"
                    height="192"
                    className="aspect-[2/3] w-full bg-raised object-cover"
                  />
                </Link>
                <div className="min-w-0 self-end">
                  <h3 className="display text-[clamp(1.75rem,1.4rem+1vw,2.5rem)] leading-[1.02] text-ink">
                    <Link to={titleHref(pick)} className="can-hover:hover:text-accent">{pick.title}</Link>
                  </h3>
                  <p className="num mt-2 text-[15px] text-muted">
                    {[pick.year, genreNames(pick.genreIds, genres).slice(0, 2).join(", "), pick.rating && `TMDB ${pick.rating.toFixed(1)}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-6 md:px-7 md:pb-7">
                <p className="line-clamp-3 max-w-[64ch] text-[15px] leading-relaxed text-muted">{pick.overview}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={titleHref(pick)} className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[15px] font-medium text-ground transition-transform active:scale-[0.97]">
                    Open {pick.mediaType === "tv" ? "Series" : "Film"}
                  </Link>
                  <Button variant={wishlisted ? "primary" : "outline"} aria-pressed={wishlisted} onClick={() => toggleWishlist(pick, wishlisted)}>
                    {wishlisted ? "On Your Wishlist" : "Add to Wishlist"}
                  </Button>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

export default TonightsPick;
