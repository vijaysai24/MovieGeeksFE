import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { titleHref } from "../../Services/images";
import { plural, todayISO } from "../../Services/format";
import { useRegion, regionName } from "../../Hooks/useRegion";
import { genreNames, useGenres } from "../../Hooks/useCatalogReference";
import { Poster } from "../Movie/PosterCard";
import { WishlistButton } from "../Movie/WishlistButton";
import { Button, IconButton } from "../UI/Button";
import { Segmented } from "../UI/Tabs";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";

const currentMonth = () => todayISO().slice(0, 7);

const shiftMonth = (month, delta) => {
  const [year, index] = month.split("-").map(Number);
  const date = new Date(year, index - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (month) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00`));
const weekday = (date) => new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date);
const dayLabel = (date) => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${date}T00:00:00`));

function Calendar() {
  const [params, setParams] = useSearchParams();
  const { region } = useRegion();
  const { data: genres = [] } = useGenres();
  const month = /^\d{4}-\d{2}$/.test(params.get("month") || "") ? params.get("month") : currentMonth();
  const kind = params.get("kind") || "theatrical";
  const mediaType = kind === "series" ? "tv" : "movie";
  const today = todayISO();

  const set = (changes) => setParams({ month, kind, ...changes }, { replace: true });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalog", "calendar", month, kind, region],
    queryFn: () => catalogApi.calendar({ month, type: kind === "digital" ? "digital" : "theatrical", mediaType, region }),
    staleTime: 30 * 60 * 1000,
  });

  const total = data?.days.reduce((sum, day) => sum + day.items.length, 0) ?? 0;
  const kindLabel = { theatrical: "in cinemas", digital: "on digital and streaming", series: "series premieres" }[kind];

  return (
    <div className="page pb-10 pt-10 md:pt-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="display text-h1 leading-[1] text-ink">Release Calendar</h1>
          <p className="num mt-4 text-lead text-muted">
            {isLoading ? " " : `${plural(total, kind === "series" ? "premiere" : "release")} ${kind === "series" ? "" : kindLabel} in ${regionName(region)}`}
          </p>
        </div>
        <Segmented
          label="Release type"
          value={kind}
          onChange={(value) => set({ kind: value })}
          options={[{ value: "theatrical", label: "Cinemas" }, { value: "digital", label: "Streaming" }, { value: "series", label: "Series" }]}
        />
      </header>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-b border-line pb-6">
        <IconButton label="Previous month" variant="overlay" onClick={() => set({ month: shiftMonth(month, -1) })}><ChevronLeft size={18} aria-hidden="true" /></IconButton>
        <h2 className="display min-w-[9ch] text-center text-[clamp(1.75rem,1.3rem+1.3vw,2.375rem)] text-ink" aria-live="polite">{monthLabel(month)}</h2>
        <IconButton label="Next month" variant="overlay" onClick={() => set({ month: shiftMonth(month, 1) })}><ChevronRight size={18} aria-hidden="true" /></IconButton>
        {month !== currentMonth() && (
          <Button variant="ghost" size="sm" onClick={() => set({ month: currentMonth() })}>This Month</Button>
        )}
      </div>

      <div className="mt-8">
        {isLoading && <div className="space-y-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 w-full rounded-panel" />)}</div>}
        {isError && <ErrorState message="The calendar didn't load. Months with many releases can take a few seconds the first time." onRetry={refetch} />}
        {data && !data.days.length && (
          <EmptyState icon={CalendarDays} title="Nothing dated yet">TMDB has no {kindLabel} dated for {regionName(region)} this month. Try streaming, or another month.</EmptyState>
        )}

        <ol className="divide-y divide-line">
          {data?.days.map((day) => {
            const isToday = day.date === today;
            const date = new Date(`${day.date}T00:00:00`);
            return (
              <li key={day.date} aria-labelledby={`day-${day.date}`} className="grid gap-4 py-8 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
                <div className="md:sticky md:top-24 md:self-start">
                  <h3 id={`day-${day.date}`} className="flex items-baseline gap-3 md:block">
                    <span className={`display num block text-[3rem] leading-none md:text-[3.75rem] ${isToday ? "text-accent" : "text-ink"}`}>{date.getDate()}</span>
                    <span className="block text-ui text-muted md:mt-2">{weekday(date)}</span>
                    <span className="sr-only">{dayLabel(day.date)}</span>
                  </h3>
                  {isToday && <p className="mt-1 text-[13px] font-medium text-accent">Today</p>}
                  {day.date < today && <p className="mt-1 text-[13px] text-faint">Out now</p>}
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {day.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 rounded-panel bg-surface p-3 pr-4 transition-colors can-hover:hover:bg-raised">
                      <Link to={titleHref(item)} className="w-14 flex-none overflow-hidden rounded-[6px]" tabIndex={-1} aria-hidden="true"><Poster path={item.posterPath} title={item.title} sizes="56px" /></Link>
                      <div className="min-w-0 flex-1">
                        <Link to={titleHref(item)} className="block truncate text-[15px] font-medium text-ink can-hover:hover:text-accent">{item.title}</Link>
                        <p className="truncate text-[13px] text-faint">
                          {[genreNames(item.genreIds, genres).slice(0, 2).join(", "), item.originalLanguage?.toUpperCase()].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <WishlistButton title={item} showLabel={false} />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default Calendar;
