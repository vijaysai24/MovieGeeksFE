import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { catalogApi } from "../../Services/catalogService";
import { formatNumber } from "../../Services/format";
import { useRegion, regionName } from "../../Hooks/useRegion";
import { useGenres, useLanguages, useProviders, COMMON_LANGUAGES } from "../../Hooks/useCatalogReference";
import { tmdbImage } from "../../Services/images";
import { PosterGrid } from "../Movie/PosterGrid";
import { Tabs, Segmented } from "../UI/Tabs";
import { Select } from "../UI/Field";
import { Button } from "../UI/Button";
import { EmptyState, ErrorState } from "../UI/States";

// Each tab is a starting point; filters narrow it further where TMDB's discover supports it.
const TABS = {
  movie: [
    { value: "popular", label: "Popular", base: { sort: "popularity" } },
    { value: "theatres", label: "In cinemas", base: { availability: "theatres" } },
    { value: "streaming", label: "Streaming", base: { availability: "streaming" } },
    { value: "upcoming", label: "Coming soon", base: { availability: "upcoming", sort: "popularity" } },
    { value: "top_rated", label: "Top rated", base: { sort: "rating" } },
    { value: "hidden_gems", label: "Hidden gems", list: "hidden_gems" },
    { value: "trending", label: "Trending", list: "trending" },
  ],
  tv: [
    { value: "popular", label: "Popular", base: { sort: "popularity" } },
    { value: "streaming", label: "Streaming", base: { availability: "streaming" } },
    { value: "airing_today", label: "Airing today", list: "airing_today" },
    { value: "on_the_air", label: "On the air", list: "on_the_air" },
    { value: "new_on_streaming", label: "New on streaming", list: "new_on_streaming" },
    { value: "top_rated", label: "Top rated", base: { sort: "rating" } },
    { value: "hidden_gems", label: "Hidden gems", list: "hidden_gems" },
  ],
};

const PRESETS = {
  theatres: { type: "movie", list: "theatres", title: "In cinemas" },
  streaming: { type: "movie", list: "streaming", title: "Streaming" },
  series: { type: "tv", list: "popular", title: "Series" },
};

const SORTS = [
  { value: "popularity", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "votes", label: "Most voted" },
  { value: "title", label: "A to Z" },
];

const RATINGS = [["", "Any rating"], ["6", "6+"], ["7", "7+"], ["8", "8+"]];

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear + 2 - 1920 }, (_, index) => thisYear + 1 - index);

const describe = ({ tab, mediaType, region, total }) => {
  const noun = mediaType === "tv" ? "series" : "films";
  const where = regionName(region);
  const phrases = {
    popular: `Popular ${noun} right now`,
    theatres: `Films in cinemas in ${where}`,
    streaming: `${mediaType === "tv" ? "Series" : "Films"} on streaming services in ${where}`,
    upcoming: `Films opening in ${where} soon`,
    top_rated: `The highest-rated ${noun} on TMDB`,
    hidden_gems: `Well-loved ${noun} most people haven't found yet`,
    trending: "What everyone is watching this week",
    airing_today: "Series with an episode out today",
    on_the_air: "Series airing new episodes this week",
    new_on_streaming: `Series that arrived on streaming in ${where} in the last two months`,
  };
  return total !== undefined ? `${phrases[tab] || "Discover"} · ${formatNumber(total)} titles` : phrases[tab];
};

function Discover({ preset }) {
  const presetConfig = PRESETS[preset];
  const [params, setParams] = useSearchParams();
  const { region } = useRegion();
  const { data: genres = [] } = useGenres();
  const { data: languages = [] } = useLanguages();

  const mediaType = params.get("type") || presetConfig?.type || localStorage.getItem("cf:prefers") || "movie";
  const tabs = TABS[mediaType] || TABS.movie;
  const tab = tabs.find((item) => item.value === (params.get("list") || presetConfig?.list)) || tabs[0];
  const { data: providers = [] } = useProviders(mediaType, region);

  const filters = {
    genres: params.get("genre") ? [Number(params.get("genre"))] : [],
    language: params.get("language") || "",
    yearFrom: params.get("from") || "",
    yearTo: params.get("to") || "",
    ratingMin: params.get("rating") || "",
    providers: params.get("providers") ? params.get("providers").split(",").map(Number) : [],
    sort: params.get("sort") || "",
  };
  const filtered = Object.values(filters).some((value) => (Array.isArray(value) ? value.length : value));
  const usesList = Boolean(tab.list);

  const set = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined || (Array.isArray(value) && !value.length)) next.delete(key);
      else next.set(key, Array.isArray(value) ? value.join(",") : value);
    });
    setParams(next, { replace: true });
  };

  const queryParams = useMemo(() => (usesList
    ? { list: tab.list, mediaType, region }
    : { mediaType, region, ...tab.base, ...Object.fromEntries(Object.entries(filters).filter(([, value]) => (Array.isArray(value) ? value.length : value))) }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [usesList, tab.value, mediaType, region, params.toString()]);

  const query = useInfiniteQuery({
    queryKey: ["catalog", "browse", queryParams],
    queryFn: ({ pageParam }) => (usesList
      ? catalogApi.list(queryParams.list, { mediaType, region, page: pageParam })
      : catalogApi.discover({ ...queryParams, page: pageParam })),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
  });

  const items = useMemo(() => {
    const seen = new Set();
    return (query.data?.pages.flatMap((page) => page.items) || []).filter((item) => {
      const key = `${item.mediaType}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [query.data]);
  const total = query.data?.pages[0]?.totalResults;

  const pageTitle = presetConfig && !params.get("type") && !params.get("list") ? presetConfig.title : "Discover";
  const genreOptions = genres.filter((genre) => genre.mediaTypes.includes(mediaType));
  const commonLanguages = COMMON_LANGUAGES.map((code) => languages.find((language) => language.code === code)).filter(Boolean);
  const otherLanguages = languages.filter((language) => !COMMON_LANGUAGES.includes(language.code));

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{pageTitle}</h1>
          <p className="num mt-1 text-[15px] text-muted">{describe({ tab: tab.value, mediaType, region, total })}</p>
        </div>
        <Segmented
          label="Films or series"
          value={mediaType}
          onChange={(value) => set({ type: value, list: "", genre: "", providers: "" })}
          options={[{ value: "movie", label: "Films" }, { value: "tv", label: "Series" }]}
        />
      </div>

      <Tabs
        className="mt-6"
        label="Lists"
        value={tab.value}
        onChange={(value) => set({ list: value, type: mediaType })}
        tabs={tabs.map((item) => ({ value: item.value, label: item.label }))}
      />

      {usesList ? (
        <p className="mt-5 text-sm text-faint">This list is curated as it is. Switch to Popular or Top rated to filter by genre, language, year or service.</p>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Select aria-label="Genre" value={filters.genres[0] || ""} onChange={(event) => set({ genre: event.target.value })} className="min-w-36">
            <option value="">All genres</option>
            {genreOptions.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
          </Select>
          <Select aria-label="Language" value={filters.language} onChange={(event) => set({ language: event.target.value })} className="min-w-36">
            <option value="">Any language</option>
            <optgroup label="Common">
              {commonLanguages.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}
            </optgroup>
            <optgroup label="All languages">
              {otherLanguages.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}
            </optgroup>
          </Select>
          <Select aria-label="From year" value={filters.yearFrom} onChange={(event) => set({ from: event.target.value })}>
            <option value="">From any year</option>
            {YEARS.map((year) => <option key={year} value={year}>From {year}</option>)}
          </Select>
          <Select aria-label="To year" value={filters.yearTo} onChange={(event) => set({ to: event.target.value })}>
            <option value="">To any year</option>
            {YEARS.map((year) => <option key={year} value={year}>To {year}</option>)}
          </Select>
          <Select aria-label="Minimum TMDB rating" value={filters.ratingMin} onChange={(event) => set({ rating: event.target.value })}>
            {RATINGS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Select aria-label="Sort" value={filters.sort || tab.base?.sort || "popularity"} onChange={(event) => set({ sort: event.target.value })}>
            {SORTS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
          </Select>
          {filtered && (
            <Button variant="ghost" size="sm" onClick={() => set({ genre: "", language: "", from: "", to: "", rating: "", providers: "", sort: "" })}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {!usesList && providers.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[13px] text-faint">On these services in {regionName(region)}</p>
          <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
            {providers.slice(0, 16).map((provider) => {
              const on = filters.providers.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ providers: on ? filters.providers.filter((id) => id !== provider.id) : [...filters.providers, provider.id] })}
                  className={`flex h-9 flex-none items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] transition-colors ${on ? "bg-ink text-ground" : "bg-surface text-muted hover:text-ink"}`}
                >
                  <img src={tmdbImage(provider.logoPath, "w92")} alt="" width="28" height="28" loading="lazy" className="h-7 w-7 rounded-full object-cover" />
                  {provider.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        {query.isError ? (
          <ErrorState message="These titles didn't load." onRetry={() => query.refetch()} />
        ) : query.isSuccess && !items.length ? (
          <EmptyState title="Nothing matches all of that">
            Try a wider year range, another language, or fewer services.
          </EmptyState>
        ) : (
          <PosterGrid items={items} loading={query.isLoading} />
        )}
      </div>

      {query.hasNextPage && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
            {query.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
          <p className="num text-[13px] text-faint">Showing {formatNumber(items.length)} of {formatNumber(total)}</p>
        </div>
      )}
    </div>
  );
}

export default Discover;
