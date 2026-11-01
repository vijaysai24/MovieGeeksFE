import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../../Services/catalogService";
import { profileImage } from "../../Services/images";
import { formatLongDate } from "../../Services/format";
import { PosterRow } from "../Movie/PosterRow";
import { Button, LinkButton } from "../UI/Button";
import { Skeleton, SkeletonText } from "../UI/States";
import { Tabs } from "../UI/Tabs";
import { Reveal } from "../UI/Reveal";

const ageOn = (birthday, until) => {
  if (!birthday) return null;
  const end = until ? new Date(until) : new Date();
  const start = new Date(birthday);
  let age = end.getFullYear() - start.getFullYear();
  if (end < new Date(end.getFullYear(), start.getMonth(), start.getDate())) age--;
  return age;
};

function Filmography({ credits, role }) {
  const byYear = useMemo(() => {
    const groups = new Map();
    credits.forEach((credit) => {
      const year = credit.year || "Upcoming";
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(credit);
    });
    return [...groups.entries()];
  }, [credits]);

  if (!credits.length) return <p className="mt-6 text-[15px] text-muted">No {role} credits on TMDB.</p>;

  return (
    <ol className="mt-6 space-y-6">
      {byYear.map(([year, items]) => (
        <li key={year} className="flex gap-6">
          <span className="num w-20 flex-none pt-0.5 text-[15px] text-faint">{year}</span>
          <ul className="flex-1 space-y-2.5">
            {items.map((credit) => (
              <li key={`${credit.mediaType}:${credit.id}:${credit.job || credit.character}`}>
                <Link to={`/${credit.mediaType}/${credit.id}`} className="text-[15px] text-ink hover:text-accent">{credit.title}</Link>
                <span className="text-[13px] text-faint">
                  {credit.mediaType === "tv" && " · Series"}
                  {credit.character && ` as ${credit.character}`}
                  {credit.job && ` · ${credit.job}`}
                </span>
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

  if (isLoading) {
    return (
      <div className="md:grid md:grid-cols-[40fr_60fr]">
        <Skeleton className="h-[60svh] rounded-none md:h-[calc(100svh-64px)]" />
        <div className="bg-paper px-5 py-12 md:px-14"><Skeleton className="h-14 w-2/3" /><SkeletonText className="mt-8" lines={5} /></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8">
        <h1 className="display text-5xl">This person didn't load</h1>
        <div className="mt-8 flex gap-3">
          <Button variant="primary" onClick={() => refetch()}>Try again</Button>
          <LinkButton to="/discover" variant="secondary">Browse films</LinkButton>
        </div>
      </div>
    );
  }

  const directs = person.knownForDepartment === "Directing" || person.knownForDepartment === "Writing";
  const activeTab = tab || (directs && person.crew.length ? "crew" : "cast");
  const age = ageOn(person.birthday, person.deathday);
  const born = person.birthday && `Born ${formatLongDate(person.birthday)}${person.placeOfBirth ? ` in ${person.placeOfBirth}` : ""}`;
  const bio = person.biography;

  return (
    <>
      <div className="md:grid md:grid-cols-[40fr_60fr]">
        <div className="sticky top-14 h-[60svh] bg-raised md:top-16 md:h-[calc(100svh-64px)]">
          {person.profilePath ? (
            <img
              src={profileImage(person.profilePath, "h632")}
              alt={person.name}
              width="632"
              height="948"
              className="h-full w-full object-cover"
              style={{ objectPosition: "50% 20%" }}
            />
          ) : (
            <div className="flex h-full items-center justify-center"><span className="display text-6xl text-muted">{person.name}</span></div>
          )}
        </div>
        <article className="relative z-10 -mt-[10svh] bg-paper px-5 pb-16 pt-10 md:mt-0 md:px-14 md:pt-16 lg:px-[72px]">
          <div className="max-w-[640px]">
            <Reveal>
              <h1 className="display max-w-[14ch] text-[clamp(2.75rem,5vw,4.5rem)] text-ink">{person.name}</h1>
              <p className="mt-4 text-[15px] text-muted">
                {[person.knownForDepartment === "Acting" ? "Actor" : person.knownForDepartment, born, person.deathday ? `Died ${formatLongDate(person.deathday)}, aged ${age}` : age && `aged ${age}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </Reveal>

            {bio && (
              <Reveal index={1}>
                <p className={`mt-8 whitespace-pre-line text-[17px] leading-[1.65] text-ink ${expanded ? "" : "line-clamp-6"}`}>{bio}</p>
                {bio.length > 600 && (
                  <Button variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)} className="mt-2 -ml-3.5">
                    {expanded ? "Show less" : "Read the full biography"}
                  </Button>
                )}
              </Reveal>
            )}

            <section aria-labelledby="filmography-title" className="mt-[clamp(112px,9vw,136px)]">
              <h2 id="filmography-title" className="display text-[clamp(2rem,2.6vw,2.5rem)] text-ink">Filmography</h2>
              <Tabs
                className="mt-5"
                ruled={false}
                label="Credits"
                value={activeTab}
                onChange={setTab}
                tabs={[
                  { value: "cast", label: "Acting", count: person.cast.length },
                  { value: "crew", label: "Directing and writing", count: person.crew.length },
                ]}
              />
              <Filmography credits={activeTab === "cast" ? person.cast : person.crew} role={activeTab === "cast" ? "acting" : "directing or writing"} />
            </section>
          </div>
        </article>
      </div>

      <div className="mx-auto mt-[clamp(96px,10vw,160px)] max-w-[1440px] px-4 md:px-8">
        <PosterRow title={`${person.name.split(" ")[0]}'s best-known work`} items={person.knownFor} />
      </div>
    </>
  );
}

export default Person;
