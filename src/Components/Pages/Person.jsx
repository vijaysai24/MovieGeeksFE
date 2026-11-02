import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../../Services/catalogService";
import { backdropSrcSet, profileImage, tmdbImage, titleHref } from "../../Services/images";
import { formatLongDate, plural } from "../../Services/format";
import { Poster } from "../Movie/PosterCard";
import { PosterRow } from "../Movie/PosterRow";
import { Button, LinkButton } from "../UI/Button";
import { SectionHead } from "../UI/Section";
import { Skeleton, SkeletonText } from "../UI/States";
import { Tabs } from "../UI/Tabs";

const ageOn = (birthday, until) => {
  if (!birthday) return null;
  const end = until ? new Date(until) : new Date();
  const start = new Date(birthday);
  let age = end.getFullYear() - start.getFullYear();
  if (end < new Date(end.getFullYear(), start.getMonth(), start.getDate())) age--;
  return age;
};

// One row per title per year: a director who also wrote and produced reads as one credit.
function Filmography({ credits, role }) {
  const byYear = useMemo(() => {
    const groups = new Map();
    credits.forEach((credit) => {
      const year = credit.year || "Upcoming";
      if (!groups.has(year)) groups.set(year, new Map());
      const titles = groups.get(year);
      const key = `${credit.mediaType}:${credit.id}`;
      if (!titles.has(key)) titles.set(key, { ...credit, roles: [] });
      const part = credit.character ? `as ${credit.character}` : credit.job;
      if (part && !titles.get(key).roles.includes(part)) titles.get(key).roles.push(part);
    });
    return [...groups.entries()].map(([year, titles]) => [year, [...titles.values()]]);
  }, [credits]);

  if (!credits.length) return <p className="text-[15px] text-muted">No {role} credits on TMDB.</p>;

  return (
    <ol className="divide-y divide-line">
      {byYear.map(([year, items]) => (
        <li key={year} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-5 md:grid-cols-[6rem_minmax(0,1fr)]">
          <span className="num pt-1 text-ui text-faint">{year}</span>
          <ul className="space-y-4">
            {items.map((credit) => (
              <li key={`${credit.mediaType}:${credit.id}`}>
                <Link to={titleHref(credit)} className="group flex items-center gap-4">
                  <span className="w-10 flex-none overflow-hidden rounded-[4px]"><Poster path={credit.posterPath} title={credit.title} sizes="40px" /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-ui font-medium text-ink can-hover:group-hover:text-accent">
                      {credit.title}{credit.mediaType === "tv" && <span className="font-normal text-faint"> · Series</span>}
                    </span>
                    {credit.roles.length > 0 && <span className="block truncate text-[14px] text-faint">{credit.roles.join(", ")}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function Person() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState(null);
  const { data: person, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalog", "person", Number(id)],
    queryFn: () => catalogApi.person(id),
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (person) document.title = `${person.name} · Cinefile`;
    return () => {
      document.title = "Cinefile";
    };
  }, [person]);

  if (isLoading) {
    return (
      <div aria-busy="true">
        <Skeleton className="h-[40svh] min-h-[280px] w-full rounded-none" />
        <div className="page -mt-24 grid gap-8 md:grid-cols-[240px_1fr]">
          <Skeleton className="aspect-[2/3] w-36 rounded-panel md:w-full" />
          <div className="self-end"><Skeleton className="h-14 w-2/3" /><SkeletonText className="mt-6" lines={4} /></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page pb-10 pt-32">
        <h1 className="display text-h1">This person didn’t load</h1>
        <div className="mt-8 flex gap-3">
          <Button variant="primary" onClick={() => refetch()}>Try Again</Button>
          <LinkButton to="/discover" variant="secondary">Browse Films</LinkButton>
        </div>
      </div>
    );
  }

  const directs = person.knownForDepartment === "Directing" || person.knownForDepartment === "Writing";
  const activeTab = tab || (directs && person.crew.length ? "crew" : "cast");
  const age = ageOn(person.birthday, person.deathday);
  const born = person.birthday && `Born ${formatLongDate(person.birthday)}${person.placeOfBirth ? ` in ${person.placeOfBirth}` : ""}`;
  const bio = person.biography;
  const banner = person.knownFor.find((title) => title.backdropPath);
  const titlesCount = new Set([...person.cast, ...person.crew].map((credit) => `${credit.mediaType}:${credit.id}`)).size;

  return (
    <>
      <section aria-labelledby="person-name">
        <div className="relative h-[40svh] min-h-[280px] overflow-hidden bg-surface">
          {banner && (
            <>
              <img src={tmdbImage(banner.backdropPath, "w1280")} srcSet={backdropSrcSet(banner.backdropPath)} sizes="100vw" alt="" width="1920" height="1080" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover opacity-70" />
              <div className="scrim-bottom absolute inset-0" aria-hidden="true" />
            </>
          )}
        </div>

        <div className="page relative -mt-32 grid gap-8 md:-mt-40 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-12 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div className="w-36 overflow-hidden rounded-panel bg-raised shadow-poster md:w-full">
            {person.profilePath ? (
              <img src={profileImage(person.profilePath, "h632")} alt={person.name} width="632" height="948" fetchpriority="high" className="aspect-[2/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[2/3] items-end p-4"><span className="display text-2xl text-muted">{person.name}</span></div>
            )}
          </div>

          <div className="min-w-0 md:self-end">
            <h1 id="person-name" className="display max-w-[16ch] text-h1 leading-[0.98] text-ink">{person.name}</h1>
            <p className="num mt-4 text-ui text-muted">
              {[person.knownForDepartment === "Acting" ? "Actor" : person.knownForDepartment === "Directing" ? "Director" : person.knownForDepartment, born, person.deathday ? `Died ${formatLongDate(person.deathday)}, aged ${age}` : age && `aged ${age}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="num mt-1 text-[14px] text-faint">{plural(titlesCount, "title")} on TMDB</p>

            {bio && (
              <div className="mt-7 max-w-[68ch]">
                <p className={`whitespace-pre-line text-read text-ink ${expanded ? "" : "line-clamp-5"}`}>{bio}</p>
                {bio.length > 480 && (
                  <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="mt-2 text-[15px] font-medium text-accent can-hover:hover:text-accent-hover">
                    {expanded ? "Show Less" : "Read the Full Biography"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <PosterRow className="page section-gap" title="Best Known For" items={person.knownFor} />

      <section aria-labelledby="filmography-title" className="page mt-20 md:mt-28">
        <SectionHead id="filmography-title" title="Filmography" />
        <Tabs
          label="Credits"
          value={activeTab}
          onChange={setTab}
          tabs={[
            { value: "cast", label: "Acting", count: new Set(person.cast.map((credit) => `${credit.mediaType}:${credit.id}`)).size },
            { value: "crew", label: "Directing and Writing", count: new Set(person.crew.map((credit) => `${credit.mediaType}:${credit.id}`)).size },
          ]}
        />
        <div className="mt-4 max-w-4xl">
          <Filmography credits={activeTab === "cast" ? person.cast : person.crew} role={activeTab === "cast" ? "acting" : "directing or writing"} />
        </div>
      </section>
    </>
  );
}

export default Person;
