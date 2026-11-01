import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { reviewApi } from "../../Services/userService";
import { tmdbImage, titleHref } from "../../Services/images";
import { formatLongDate, formatMoney, formatNumber, formatRuntime } from "../../Services/format";
import { useRegion } from "../../Hooks/useRegion";
import { useDebouncedValue } from "../../Hooks/useDebouncedValue";
import { Poster } from "../Movie/PosterCard";
import { TextInput } from "../UI/Field";
import { Skeleton } from "../UI/States";

const parseRef = (value) => {
  const match = /^(movie|tv):(\d+)$/.exec(value || "");
  return match ? { mediaType: match[1], id: Number(match[2]) } : null;
};

function Picker({ onPick, label }) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 250);
  const { data = [] } = useQuery({
    queryKey: ["catalog", "autocomplete", debounced.toLowerCase()],
    queryFn: () => catalogApi.autocomplete(debounced),
    enabled: debounced.length >= 2,
  });
  const options = data.filter((item) => item.mediaType !== "person");

  return (
    <div className="rounded-lg bg-surface p-4">
      <TextInput aria-label={label} placeholder="Find a film or series" value={query} onChange={(event) => setQuery(event.target.value)} />
      <ul className="mt-2 space-y-1">
        {options.map((item) => (
          <li key={`${item.mediaType}:${item.id}`}>
            <button type="button" onClick={() => onPick(`${item.mediaType}:${item.id}`)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-raised">
              <img src={tmdbImage(item.posterPath, "w92")} alt="" width="28" height="42" className="h-[42px] w-7 flex-none rounded-[2px] bg-raised object-cover" />
              <span className="truncate text-sm text-ink">{item.title} <span className="text-faint">{item.year}</span></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useTitle(ref, region) {
  const details = useQuery({
    queryKey: ["catalog", "title", ref?.mediaType, ref?.id, region],
    queryFn: () => catalogApi.details(ref.mediaType, ref.id, region),
    enabled: Boolean(ref),
  });
  const community = useQuery({
    queryKey: ["community", ref?.mediaType, ref?.id],
    queryFn: () => reviewApi.community(ref.mediaType, ref.id),
    enabled: Boolean(ref),
  });
  return { title: details.data, community: community.data, loading: details.isLoading && Boolean(ref) };
}

const ROWS = [
  ["Released", (t) => formatLongDate(t.releaseDate)],
  ["Runtime", (t) => (t.mediaType === "tv" ? `${t.tv.numberOfSeasons} seasons` : formatRuntime(t.runtime)), (t) => (t.mediaType === "tv" ? null : t.runtime)],
  ["Genres", (t) => t.genres.map((g) => g.name).join(", ")],
  ["Directed by", (t) => (t.mediaType === "tv" ? t.crew.creators : t.crew.directors).map((p) => p.name).join(", ") || "-"],
  ["Starring", (t) => t.cast.slice(0, 3).map((p) => p.name).join(", ") || "-"],
  ["TMDB", (t) => (t.externalRatings.tmdb ? `${t.externalRatings.tmdb.score.toFixed(1)} /10` : "-"), (t) => t.externalRatings.tmdb?.score],
  ["IMDb", (t) => (t.externalRatings.imdb ? `${t.externalRatings.imdb.score.toFixed(1)} /10` : "-"), (t) => t.externalRatings.imdb?.score],
  ["Members", (t, c) => (c?.ratingCount ? `${c.averageRating.toFixed(1)} /10 (${formatNumber(c.ratingCount)})` : "-"), (t, c) => c?.averageRating],
  ["Where to watch", (t) => [...t.providers.stream, ...t.providers.free].slice(0, 3).map((p) => p.name).join(", ") || "Not streaming here"],
  ["Budget", (t) => formatMoney(t.budget) || "-", (t) => t.budget],
  ["Box office", (t) => formatMoney(t.revenue) || "-", (t) => t.revenue],
];

function Column({ data, onClear, side }) {
  if (data.loading) return <Skeleton className="h-72 w-full" />;
  if (!data.title) return null;
  return (
    <div className="flex items-start gap-4">
      <Link to={titleHref(data.title)} className="w-24 flex-none overflow-hidden rounded-[4px]"><Poster path={data.title.posterPath} title={data.title.title} sizes="96px" /></Link>
      <div className="min-w-0 flex-1">
        <Link to={titleHref(data.title)} className="display block text-[1.75rem] leading-tight text-ink hover:text-accent">{data.title.title}</Link>
        <p className="mt-1 text-sm text-faint">{data.title.year} · {data.title.mediaType === "tv" ? "Series" : "Film"}</p>
      </div>
      <button type="button" aria-label={`Remove ${side}`} onClick={onClear} className="rounded-full p-1.5 text-faint hover:text-ink"><X size={16} /></button>
    </div>
  );
}

function Compare() {
  const [params, setParams] = useSearchParams();
  const { region } = useRegion();
  const a = parseRef(params.get("a"));
  const b = parseRef(params.get("b"));
  const left = useTitle(a, region);
  const right = useTitle(b, region);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const both = left.title && right.title;

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-8 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Compare</h1>
      <p className="mt-1 text-[15px] text-muted">Two titles side by side: when they came out, who made them, how they scored and where to watch them.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {a ? <Column data={left} side="first title" onClear={() => set("a", null)} /> : <Picker label="First title" onPick={(value) => set("a", value)} />}
        {b ? <Column data={right} side="second title" onClear={() => set("b", null)} /> : <Picker label="Second title" onPick={(value) => set("b", value)} />}
      </div>

      {both && (
        <table className="num mt-10 w-full text-left text-[15px]">
          <caption className="sr-only">{left.title.title} compared with {right.title.title}</caption>
          <thead>
            <tr className="text-[13px] text-faint">
              <th scope="col" className="w-32 py-2 font-normal md:w-44"><span className="sr-only">Detail</span></th>
              <th scope="col" className="py-2 font-normal">{left.title.title}</th>
              <th scope="col" className="py-2 font-normal">{right.title.title}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, show, score]) => {
              const leftScore = score?.(left.title, left.community);
              const rightScore = score?.(right.title, right.community);
              const leader = leftScore && rightScore && leftScore !== rightScore ? (leftScore > rightScore ? "left" : "right") : null;
              return (
                <tr key={label} className="border-t border-line align-top">
                  <th scope="row" className="py-3 pr-4 text-[13px] font-normal text-faint">{label}</th>
                  <td className={`py-3 pr-4 ${leader === "left" ? "font-semibold text-ink" : "text-muted"}`}>{show(left.title, left.community)}</td>
                  <td className={`py-3 ${leader === "right" ? "font-semibold text-ink" : "text-muted"}`}>{show(right.title, right.community)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Compare;
