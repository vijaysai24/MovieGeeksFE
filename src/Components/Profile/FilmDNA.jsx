import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "../../Services/userService";
import { profileImage } from "../../Services/images";
import { formatNumber, plural } from "../../Services/format";
import { BarList, ColumnChart } from "../UI/Bars";
import { Select } from "../UI/Field";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Block({ title, note, children, className = "" }) {
  return (
    <section className={`rounded-panel bg-surface p-5 md:p-7 ${className}`}>
      <h3 className="text-h3 font-semibold text-ink">{title}</h3>
      {note && <p className="mt-1 text-[14px] text-faint">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function People({ people, empty }) {
  if (!people.length) return <p className="text-[15px] text-muted">{empty}</p>;
  return (
    <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {people.slice(0, 6).map((person) => (
        <li key={person.id}>
          <Link to={`/person/${person.id}`} className="group flex items-center gap-3">
            {person.profilePath ? (
              <img src={profileImage(person.profilePath, "w185")} alt="" width="48" height="48" loading="lazy" className="h-12 w-12 flex-none rounded-full bg-raised object-cover" />
            ) : (
              <span className="h-12 w-12 flex-none rounded-full bg-raised" aria-hidden="true" />
            )}
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-medium text-ink can-hover:group-hover:text-accent">{person.name}</span>
              <span className="num block text-[13px] text-faint">{plural(person.titles, "title")} · avg {person.averageRating?.toFixed(1) ?? "-"}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// What someone's ratings and diary say about their taste.
export function FilmDNA({ username, name, isSelf }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: stats, isLoading, isError, refetch, isPlaceholderData } = useQuery({
    queryKey: ["stats", username, year],
    queryFn: () => identityApi.userStats(username, year),
    placeholderData: (previous) => previous,
  });

  if (isLoading) return <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-72 rounded-panel" /><Skeleton className="h-72 rounded-panel" /></div>;
  if (isError) return <ErrorState message="Stats didn't load." onRetry={refetch} />;

  const { totals, identity } = stats;
  if (!totals.movies && !totals.series) {
    return (
      <EmptyState title={isSelf ? "Your film DNA builds as you watch" : "No film DNA yet"}>
        {isSelf ? "Mark titles as watched and rate them. Your archetype, favourite directors and habits appear here." : `${name} hasn't watched enough to read yet.`}
      </EmptyState>
    );
  }

  const they = isSelf ? "you" : "they";
  const years = [...new Set([new Date().getFullYear(), ...stats.diaryByYear.map((row) => row.year)])].sort((a, b) => b - a);
  const versus = totals.versusTmdb;
  const tiles = [
    ["Films", formatNumber(totals.movies)],
    ["Series", formatNumber(totals.series)],
    ["Hours of film", formatNumber(totals.hoursOfFilm)],
    ["Average rating", totals.averageRating ? `${totals.averageRating.toFixed(1)}` : "-", versus ? `${versus > 0 ? "+" : "−"}${Math.abs(versus).toFixed(1)} vs TMDB` : null],
    ["Typical release year", totals.medianReleaseYear || "-"],
    ["Lesser-known picks", `${Math.round((totals.lesserKnownShare || 0) * 100)}%`],
  ];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-panel bg-surface p-6 md:p-8">
          {identity.archetype ? (
            <>
              <p className="text-ui text-muted">{isSelf ? "Your archetype" : `${name}'s archetype`}</p>
              <h2 className="display mt-2 text-[clamp(2rem,1.4rem+2vw,3.25rem)] leading-[1.02] text-ink">{identity.archetype}</h2>
              {identity.traits.length > 0 && (
                <ul className="mt-7 space-y-4">
                  {identity.traits.map((trait) => (
                    <li key={trait.key} className="border-l-2 border-accent pl-4">
                      <p className="text-[15px] font-medium text-ink">{trait.label}</p>
                      <p className="mt-0.5 text-[14px] text-muted">{trait.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <h2 className="display text-[clamp(2rem,1.4rem+2vw,3rem)] leading-[1.02] text-ink">An archetype in the making</h2>
              <p className="mt-4 text-[15px] text-muted">
                {isSelf ? "Watch" : `${name} needs`} {plural(Math.max(0, identity.progress.needed - identity.progress.seen), "more title")} {isSelf ? "to reveal yours." : "before theirs shows."}
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuemin={0} aria-valuemax={identity.progress.needed} aria-valuenow={identity.progress.seen} aria-label="Progress to an archetype">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(identity.progress.seen / identity.progress.needed) * 100}%` }} />
              </div>
            </>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
          {tiles.map(([label, value, delta]) => (
            <div key={label} className="rounded-panel bg-surface p-5">
              <dt className="text-[13px] text-faint">{label}</dt>
              <dd className="num mt-2">
                <span className="text-[1.75rem] font-semibold leading-none text-ink">{value}</span>
                {delta && <span className="mt-1.5 block text-[13px] text-muted">{delta}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title={`How ${they} score`} note={`${plural(totals.ratings, "rating")}, from 1 to 10`}>
          <ColumnChart label="Ratings given, by score" data={stats.ratingDistribution.map((bin) => ({ label: String(bin.rating), title: `Rated ${bin.rating}`, value: bin.count }))} valueLabel={(item) => plural(item.value, "title")} />
        </Block>
        <Block title="Decades" note={`When the films ${they} watch were made`}>
          <ColumnChart label="Titles watched, by decade" data={stats.decades.map((row) => ({ label: `${String(row.decade).slice(2)}s`, title: `${row.decade}s`, value: row.titles }))} valueLabel={(item) => plural(item.value, "title")} />
        </Block>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Genres" note="Share of everything watched">
          <BarList label="Genres watched" items={stats.genres.slice(0, 8).map((genre) => ({ key: genre.id, label: genre.name, value: genre.titles, display: `${Math.round(genre.share * 100)}%` }))} />
        </Block>
        <Block title="Languages" note={`Original language of what ${they} watch`}>
          <BarList label="Languages watched" items={stats.languages.slice(0, 8).map((language) => ({ key: language.code, label: language.name, value: language.titles, display: plural(language.titles, "title") }))} />
        </Block>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Most-watched directors">
          <People people={stats.directors} empty="No directors yet." />
        </Block>
        <Block title="Most-watched actors">
          <People people={stats.actors} empty="No actors yet." />
        </Block>
      </div>

      <Block title={`Diary in ${year}`} note="Entries logged each month, rewatches included">
        <div className={`transition-opacity ${isPlaceholderData ? "opacity-50" : ""}`}>
          {years.length > 1 && (
            <div className="-mt-2 mb-6">
              <label htmlFor="dna-year" className="sr-only">Year</label>
              <Select id="dna-year" value={year} onChange={(event) => setYear(Number(event.target.value))}>
                {years.map((option) => <option key={option} value={option}>{option}</option>)}
              </Select>
            </div>
          )}
          <ColumnChart
            label={`Diary entries per month in ${year}`}
            height={140}
            data={stats.monthlyActivity.map((row) => ({ label: MONTHS[row.month - 1], title: MONTH_NAMES[row.month - 1], value: row.entries }))}
            valueLabel={(item) => plural(item.value, "entry", "entries")}
          />
        </div>
      </Block>
    </div>
  );
}
