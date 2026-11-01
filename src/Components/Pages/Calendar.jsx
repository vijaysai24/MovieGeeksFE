import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { titleHref } from "../../Services/images";
import { plural, todayISO } from "../../Services/format";
import { useRegion, regionName } from "../../Hooks/useRegion";
import { genreNames, useGenres } from "../../Hooks/useCatalogReference";
import { Poster } from "../Movie/PosterCard";
import { WishlistButton } from "../Movie/WishlistButton";
import { IconButton } from "../UI/Button";
import { Segmented } from "../UI/Tabs";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";

const currentMonth = () => todayISO().slice(0, 7);

const shiftMonth = (month, delta) => {
  const [year, index] = month.split("-").map(Number);
  const date = new Date(year, index - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (month) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00`));
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
    <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Release calendar</h1>
          <p className="num mt-1 text-[15px] text-muted">
            {isLoading ? " " : `${plural(total, kind === "series" ? "premiere" : "release")} ${kind === "series" ? "" : kindLabel} in ${regionName(region)}, ${monthLabel(month)}`}
          </p>
        </div>
        <Segmented
          label="Release type"
          value={kind}
          onChange={(value) => set({ kind: value })}
          options={[{ value: "theatrical", label: "Cinemas" }, { value: "digital", label: "Streaming" }, { value: "series", label: "Series" }]}
        />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <IconButton label="Previous month" onClick={() => set({ month: shiftMonth(month, -1) })}><ChevronLeft size={18} /></IconButton>
        <span className="min-w-40 text-center text-base font-medium text-ink">{monthLabel(month)}</span>
        <IconButton label="Next month" onClick={() => set({ month: shiftMonth(month, 1) })}><ChevronRight size={18} /></IconButton>
        {month !== currentMonth() && (
          <button type="button" onClick={() => set({ month: currentMonth() })} className="ml-2 text-sm text-muted hover:text-ink">This month</button>
        )}
      </div>

      <div className="mt-8">
        {isLoading && <div className="space-y-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 w-full" />)}</div>}
        {isError && <ErrorState message="The calendar didn't load. Months with many releases can take a few seconds the first time." onRetry={refetch} />}
        {data && !data.days.length && (
          <EmptyState title="Nothing dated yet">TMDB has no {kindLabel} dated for {regionName(region)} this month. Try streaming, or another month.</EmptyState>
        )}

        <ol className="space-y-8">
          {data?.days.map((day) => (
            <li key={day.date} aria-labelledby={`day-${day.date}`}>
              <h2 id={`day-${day.date}`} className={`flex items-baseline gap-3 text-base font-semibold ${day.date === today ? "text-accent" : "text-ink"}`}>
                {dayLabel(day.date)}
                {day.date === today && <span className="text-[13px] font-normal">Today</span>}
                {day.date < today && <span className="text-[13px] font-normal text-faint">Out now</span>}
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {day.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 rounded-lg bg-surface p-2.5 pr-3">
                    <Link to={titleHref(item)} className="w-12 flex-none overflow-hidden rounded-[3px]"><Poster path={item.posterPath} title={item.title} sizes="48px" /></Link>
                    <div className="min-w-0 flex-1">
                      <Link to={titleHref(item)} className="block truncate text-[15px] text-ink hover:text-accent">{item.title}</Link>
                      <p className="truncate text-[13px] text-faint">
                        {[genreNames(item.genreIds, genres).slice(0, 2).join(", "), item.originalLanguage?.toUpperCase()].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <WishlistButton title={item} showLabel={false} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default Calendar;
