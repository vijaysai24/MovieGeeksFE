import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { formatNumber } from "../../Services/format";
import { useRegion, regionName } from "../../Hooks/useRegion";
import { useGenres, useLanguages, useProviders, COMMON_LANGUAGES } from "../../Hooks/useCatalogReference";
import { tmdbImage } from "../../Services/images";
import { PosterGrid } from "../Movie/PosterGrid";
import { Tabs, Segmented } from "../UI/Tabs";
import { Select } from "../UI/Field";
import { Button } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { EmptyState, ErrorState } from "../UI/States";

// Each tab is a starting point; filters narrow it further where TMDB's discover supports it.
const TABS = {
  movie: [
    { value: "popular", label: "Popular", base: { sort: "popularity" } },
    { value: "theatres", label: "In Cinemas", base: { availability: "theatres" } },
    { value: "streaming", label: "Streaming", base: { availability: "streaming" } },
    { value: "upcoming", label: "Coming Soon", base: { availability: "upcoming", sort: "popularity" } },
    { value: "top_rated", label: "Top Rated", base: { sort: "rating" } },
    { value: "hidden_gems", label: "Hidden Gems", list: "hidden_gems" },
    { value: "trending", label: "Trending", list: "trending" },
  ],
  tv: [
    { value: "popular", label: "Popular", base: { sort: "popularity" } },
    { value: "streaming", label: "Streaming", base: { availability: "streaming" } },
    { value: "airing_today", label: "Airing Today", list: "airing_today" },
    { value: "on_the_air", label: "On the Air", list: "on_the_air" },
    { value: "new_on_streaming", label: "New on Streaming", list: "new_on_streaming" },
    { value: "top_rated", label: "Top Rated", base: { sort: "rating" } },
    { value: "hidden_gems", label: "Hidden Gems", list: "hidden_gems" },
  ],
};

const PRESETS = {
  theatres: { type: "movie", list: "theatres", title: "In Cinemas" },
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

const RATINGS = [{ value: "", label: "Any" }, { value: "6", label: "6+" }, { value: "7", label: "7+" }, { value: "8", label: "8+" }];

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear + 2 - 1920 }, (_, index) => thisYear + 1 - index);

const describe = ({ tab, mediaType, region }) => {
  const noun = mediaType === "tv" ? "series" : "films";
  const where = regionName(region);
  return {
    popular: `Popular ${noun} right now`,
    theatres: `Films in cinemas in ${where}`,
    streaming: `${mediaType === "tv" ? "Series" : "Films"} on streaming services in ${where}`,
    upcoming: `Films opening in ${where} soon`,
    top_rated: `The highest-rated ${noun} on TMDB`,
    hidden_gems: `Well-loved ${noun} most people haven’t found yet`,
    trending: "What everyone is watching this week",
    airing_today: "Series with an episode out today",
    on_the_air: "Series airing new episodes this week",
    new_on_streaming: `Series that arrived on streaming in ${where} in the last two months`,
  }[tab] || "Discover";
};

function FilterGroup({ label, htmlFor, children }) {
  return (
    <div>
      {htmlFor ? <label htmlFor={htmlFor} className="mb-2 block text-[14px] font-medium text-ink">{label}</label> : <p className="mb-2 text-[14px] font-medium text-ink">{label}</p>}
      {children}
    </div>
  );
}

// The same controls serve the desktop sidebar and the phone sheet; every change goes to the URL.
function FilterPanel({ filters, tab, set, mediaType, region, idPrefix, genres }) {
  const { data: languages = [] } = useLanguages();
  const { data: providers = [] } = useProviders(mediaType, region);
  const commonLanguages = COMMON_LANGUAGES.map((code) => languages.find((language) => language.code === code)).filter(Boolean);
  const otherLanguages = languages.filter((language) => !COMMON_LANGUAGES.includes(language.code));

  return (
    <div className="space-y-7">
      {genres && (
        <FilterGroup label="Genre" htmlFor={`${idPrefix}-genre`}>
          <Select id={`${idPrefix}-genre`} value={filters.genres[0] || ""} onChange={(event) => set({ genre: event.target.value })} className="h-10 w-full">
            <option value="">All genres</option>
            {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
          </Select>
        </FilterGroup>
      )}
      <FilterGroup label="Sort by" htmlFor={`${idPrefix}-sort`}>
        <Select id={`${idPrefix}-sort`} value={filters.sort || tab.base?.sort || "popularity"} onChange={(event) => set({ sort: event.target.value })} className="h-10 w-full">
          {SORTS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
        </Select>
      </FilterGroup>

      <FilterGroup label="TMDB rating">
        <Segmented label="Minimum TMDB rating" size="sm" value={filters.ratingMin} onChange={(value) => set({ rating: value })} options={RATINGS} />
      </FilterGroup>

      <FilterGroup label="Released">
        <div className="grid gap-2">
          <Select aria-label="From year" value={filters.yearFrom} onChange={(event) => set({ from: event.target.value })} className="h-10 w-full">
            <option value="">From any year</option>
            {YEARS.map((year) => <option key={year} value={year}>From {year}</option>)}
          </Select>
          <Select aria-label="To year" value={filters.yearTo} onChange={(event) => set({ to: event.target.value })} className="h-10 w-full">
            <option value="">To any year</option>
            {YEARS.map((year) => <option key={year} value={year}>To {year}</option>)}
          </Select>
        </div>
      </FilterGroup>

      <FilterGroup label="Language" htmlFor={`${idPrefix}-language`}>
        <Select id={`${idPrefix}-language`} value={filters.language} onChange={(event) => set({ language: event.target.value })} className="h-10 w-full">
          <option value="">Any language</option>
          <optgroup label="Common">
            {commonLanguages.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}
          </optgroup>
          <optgroup label="All languages">
            {otherLanguages.map((language) => <option key={language.code} value={language.code}>{language.name}</option>)}
          </optgroup>
        </Select>
      </FilterGroup>

      {providers.length > 0 && (
        <FilterGroup label={`Services in ${regionName(region)}`}>
          <div className="grid grid-cols-5 gap-2">
            {providers.slice(0, 20).map((provider) => {
              const on = filters.providers.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={provider.name}
                  title={provider.name}
                  onClick={() => set({ providers: on ? filters.providers.filter((id) => id !== provider.id) : [...filters.providers, provider.id] })}
                  className={`relative rounded-[12px] transition-[opacity,box-shadow] ${on ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : "opacity-60 can-hover:hover:opacity-100"}`}
                >
                  <img src={tmdbImage(provider.logoPath, "w92")} alt="" width="44" height="44" loading="lazy" className="aspect-square w-full rounded-[12px] object-cover" />
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}
    </div>
  );
}

function Discover({ preset }) {
  const presetConfig = PRESETS[preset];
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const { region } = useRegion();
  const { data: genres = [] } = useGenres();
  const { data: languages = [] } = useLanguages();

  let preferred = "";
  try {
    preferred = localStorage.getItem("cf:prefers") || "";
  } catch {
    preferred = "";
  }
  const mediaType = params.get("type") || presetConfig?.type || preferred || "movie";
  const tabs = TABS[mediaType] || TABS.movie;
  const tab = tabs.find((item) => item.value === (params.get("list") || presetConfig?.list)) || tabs[0];
  const { data: providerList = [] } = useProviders(mediaType, region);

  const filters = {
    genres: params.get("genre") ? [Number(params.get("genre"))] : [],
    language: params.get("language") || "",
    yearFrom: params.get("from") || "",
    yearTo: params.get("to") || "",
    ratingMin: params.get("rating") || "",
    providers: params.get("providers") ? params.get("providers").split(",").map(Number) : [],
    sort: params.get("sort") || "",
  };
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
  const nameOf = (list, id, key = "id") => list.find((item) => item[key] === id)?.name;

  // Every narrowing in force, each removable on its own.
  const active = [
    filters.genres[0] && { key: "genre", label: nameOf(genres, filters.genres[0]) || "Genre", clear: { genre: "" } },
    filters.language && { key: "language", label: nameOf(languages, filters.language, "code") || filters.language, clear: { language: "" } },
    filters.yearFrom && { key: "from", label: `From ${filters.yearFrom}`, clear: { from: "" } },
    filters.yearTo && { key: "to", label: `To ${filters.yearTo}`, clear: { to: "" } },
    filters.ratingMin && { key: "rating", label: `TMDB ${filters.ratingMin}+`, clear: { rating: "" } },
    ...filters.providers.map((id) => ({ key: `p${id}`, label: nameOf(providerList, id) || "Service", clear: { providers: filters.providers.filter((other) => other !== id) } })),
    filters.sort && { key: "sort", label: SORTS.find((sort) => sort.value === filters.sort)?.label, clear: { sort: "" } },
  ].filter(Boolean);
  const clearAll = () => set({ genre: "", language: "", from: "", to: "", rating: "", providers: "", sort: "" });
  const panelFilters = active.length;

  return (
    <div className="page pb-10 pt-10 md:pt-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="display text-h1 leading-[1] text-ink">{pageTitle}</h1>
          <p className="num mt-4 text-lead text-muted">
            {describe({ tab: tab.value, mediaType, region })}
            {total !== undefined && <span className="text-faint"> · {formatNumber(total)} titles</span>}
          </p>
        </div>
        <Segmented
          label="Films or series"
          value={mediaType}
          onChange={(value) => set({ type: value, list: "", genre: "", providers: "" })}
          options={[{ value: "movie", label: "Films" }, { value: "tv", label: "Series" }]}
        />
      </header>

      <Tabs
        className="mt-8"
        label="Lists"
        value={tab.value}
        onChange={(value) => set({ list: value, type: mediaType })}
        tabs={tabs.map((item) => ({ value: item.value, label: item.label }))}
      />

      {usesList ? (
        <p className="mt-6 text-[15px] text-faint">This list is curated as it is. Switch to Popular or Top Rated to filter by genre, language, year or service.</p>
      ) : (
        <div className="mt-6 hidden flex-wrap gap-2 md:flex" role="group" aria-label="Genre">
          <button
            type="button"
            aria-pressed={!filters.genres.length}
            onClick={() => set({ genre: "" })}
            className={`h-10 flex-none rounded-full px-4 text-[15px] transition-colors ${!filters.genres.length ? "bg-ink font-medium text-ground" : "bg-surface text-muted can-hover:hover:bg-raised can-hover:hover:text-ink"}`}
          >
            All Genres
          </button>
          {genreOptions.map((genre) => {
            const on = filters.genres[0] === genre.id;
            return (
              <button
                key={genre.id}
                type="button"
                aria-pressed={on}
                onClick={() => set({ genre: on ? "" : genre.id })}
                className={`h-10 flex-none rounded-full px-4 text-[15px] transition-colors ${on ? "bg-ink font-medium text-ground" : "bg-surface text-muted can-hover:hover:bg-raised can-hover:hover:text-ink"}`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      )}

      <div className={`mt-10 ${usesList ? "" : "lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-10"}`}>
        {!usesList && (
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 rounded-panel bg-surface p-5">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-h3 font-semibold text-ink">Filters</h2>
                {active.length > 0 && <Button variant="ghost" size="sm" onClick={clearAll}>Clear All</Button>}
              </div>
              <FilterPanel filters={filters} tab={tab} set={set} mediaType={mediaType} region={region} idPrefix="side" />
            </div>
          </aside>
        )}

        <div className="min-w-0">
          {!usesList && (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <Button variant="secondary" className="lg:hidden" onClick={() => setSheet(true)}>
                <SlidersHorizontal size={16} aria-hidden="true" /> Filters{panelFilters ? ` (${panelFilters})` : ""}
              </Button>
              {active.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => set(item.clear)}
                  aria-label={`Remove filter: ${item.label}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-raised pl-4 pr-3 text-[14px] text-ink transition-colors can-hover:hover:bg-nested"
                >
                  {item.label}
                  <X size={14} className="text-faint" aria-hidden="true" />
                </button>
              ))}
              {active.length > 1 && <Button variant="ghost" onClick={clearAll} className="max-lg:hidden">Clear All</Button>}
            </div>
          )}

          {query.isError ? (
            <ErrorState message="These titles didn't load." onRetry={() => query.refetch()} />
          ) : query.isSuccess && !items.length ? (
            <EmptyState title="Nothing matches all of that" action={active.length > 0 && <Button variant="primary" onClick={clearAll}>Clear Filters</Button>}>
              Try a wider year range, another language, or fewer services.
            </EmptyState>
          ) : (
            <PosterGrid items={items} loading={query.isLoading} columns={usesList ? 6 : 5} />
          )}

          {query.hasNextPage && (
            <div className="mt-12 flex flex-col items-center gap-2">
              <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                {query.isFetchingNextPage ? "Loading…" : "Show More"}
              </Button>
              <p className="num text-[13px] text-faint">Showing {formatNumber(items.length)} of {formatNumber(total)}</p>
            </div>
          )}
        </div>
      </div>

      {sheet && (
        <Dialog open onClose={() => setSheet(false)} title="Filters">
          <FilterPanel filters={filters} tab={tab} set={set} mediaType={mediaType} region={region} idPrefix="sheet" genres={genreOptions} />
          <div className="mt-8 flex gap-3">
            {active.length > 0 && <Button variant="ghost" onClick={clearAll}>Clear All</Button>}
            <Button variant="primary" className="ml-auto" onClick={() => setSheet(false)}>
              {total !== undefined ? `Show ${formatNumber(total)} Titles` : "Show Titles"}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default Discover;
