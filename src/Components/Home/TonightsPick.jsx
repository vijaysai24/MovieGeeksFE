import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { posterSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { genreNames, useGenres, useLanguages, COMMON_LANGUAGES } from "../../Hooks/useCatalogReference";
import { Button } from "../UI/Button";
import { Skeleton } from "../UI/States";
import { WishlistButton } from "../Movie/WishlistButton";

const DECADES = [
  { value: "", label: "any decade" },
  { value: "2020", label: "the 2020s" },
  { value: "2010", label: "the 2010s" },
  { value: "2000", label: "the 2000s" },
  { value: "1990", label: "the 1990s" },
  { value: "1980", label: "the 1980s" },
  { value: "1970", label: "the 1970s" },
  { value: "1950", label: "before 1970" },
];

const RATINGS = [
  { value: "", label: "anything" },
  { value: "6", label: "6 or more" },
  { value: "7", label: "7 or more" },
  { value: "8", label: "8 or more" },
];

// A select that reads as a word in the sentence it sits in.
function InlineSelect({ label, value, onChange, children }) {
  return (
    <span className="relative inline-block align-baseline">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer appearance-none rounded-full bg-raised py-0.5 pl-3 pr-8 text-accent transition-colors hover:bg-nested focus:outline-none focus-visible:outline-2"
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

function TonightsPick({ region }) {
  const { data: genres = [] } = useGenres();
  const { data: languages = [] } = useLanguages();
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

  return (
    <section className="relative grid md:grid-cols-2" aria-labelledby="pick-title">
      <div className="relative order-1 flex flex-col bg-ground px-5 pb-10 pt-[12svh] md:min-h-[90svh] md:px-[8.33vw] md:pb-28 md:pt-[27svh]">
        <p className="max-w-[34ch] text-[clamp(1.25rem,1rem+0.8vw,1.5rem)] leading-[1.9] text-ink">
          Find me {" "}
          <InlineSelect label="Genre" value={genre} onChange={setGenre}>
            <option value="">anything good</option>
            {genreOptions.map((item) => <option key={item.id} value={item.id}>{item.name.toLowerCase()}</option>)}
          </InlineSelect>{" "}
          to watch as a{" "}
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
            {DECADES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </InlineSelect>
          , rated{" "}
          <InlineSelect label="Minimum TMDB rating" value={ratingMin} onChange={setRatingMin}>
            {RATINGS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </InlineSelect>
          .
        </p>
        <div className="mt-8">
          <Button variant="secondary" onClick={() => setSpin((value) => value + 1)} disabled={isFetching}>
            <Shuffle size={16} aria-hidden="true" />
            {isFetching ? "Looking..." : "Show me another"}
          </Button>
        </div>
      </div>

      <div className="relative order-3 flex min-h-[62svh] items-start bg-light px-5 pb-16 pt-12 text-light-ink md:min-h-[90svh] md:px-[6vw] md:pb-28 md:pt-[27svh]">
        <div data-ui aria-live="polite" className="w-full max-w-[520px]">
          {isError && (
            <p className="text-base">
              The film archive didn't answer.{" "}
              <button type="button" onClick={() => refetch()} className="font-semibold underline underline-offset-4">Try again</button>
            </p>
          )}
          {!isError && pick === undefined && (
            <div className="flex gap-5">
              <Skeleton className="h-[240px] w-[160px] flex-none bg-[#d6d4cf]!" />
              <div className="flex-1 space-y-3 pt-2">
                <Skeleton className="h-8 w-4/5 bg-[#d6d4cf]!" />
                <Skeleton className="h-4 w-1/2 bg-[#d6d4cf]!" />
              </div>
            </div>
          )}
          {!isError && pick === null && (
            <p className="text-lg">Nothing matches all of that. Loosen one of the words on the left.</p>
          )}
          {pick && (
            <article className="flex flex-col gap-5 sm:flex-row md:flex-col lg:flex-row">
              <Link to={titleHref(pick)} className="w-[160px] flex-none">
                <img
                  src={tmdbImage(pick.posterPath, "w342")}
                  srcSet={posterSrcSet(pick.posterPath)}
                  sizes="160px"
                  alt={`${pick.title} poster`}
                  width="160"
                  height="240"
                  className="aspect-[2/3] w-[160px] rounded-[4px] bg-[#d6d4cf] object-cover"
                />
              </Link>
              <div className="min-w-0">
                <h3 className="display text-[2rem] leading-[1.02]">
                  <Link to={titleHref(pick)} className="hover:underline hover:underline-offset-4">{pick.title}</Link>
                </h3>
                <p className="num mt-2 text-base text-[#4a4a4a]">
                  {[pick.year, genreNames(pick.genreIds, genres).slice(0, 2).join(", "), pick.rating && `TMDB ${pick.rating.toFixed(1)}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-4 line-clamp-4 text-base leading-relaxed text-[#2a2a2a]">{pick.overview}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link to={titleHref(pick)} className="inline-flex h-9 items-center rounded-full bg-light-ink px-4 text-sm font-medium text-light transition-transform active:scale-[0.97]">
                    Open {pick.mediaType === "tv" ? "series" : "film"}
                  </Link>
                  <WishlistButton title={pick} tone="light" />
                </div>
              </div>
            </article>
          )}
        </div>
      </div>

      {/* One heading split across the edge: its first word on the dark field, its last on the light. */}
      <h2
        id="pick-title"
        className="display order-2 bg-ground px-5 pb-10 text-[clamp(2.75rem,13vw,5rem)] md:pointer-events-none md:absolute md:z-10 md:inset-x-0 md:bottom-8 md:grid md:grid-cols-2 md:bg-transparent md:pb-0 md:pl-[8.33vw] md:pr-[6vw] md:text-[clamp(2.5rem,5vw,5rem)]"
      >
        <span className="text-ink">Tonight's</span>{" "}
        <span className="text-ink md:text-right md:text-light-ink">pick</span>
      </h2>
    </section>
  );
}

export default TonightsPick;
