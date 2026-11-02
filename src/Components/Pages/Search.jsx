import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CalendarClock, Clapperboard, Gem, MonitorPlay, Popcorn, Trophy, UserRound } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { socialApi } from "../../Services/userService";
import { profileImage } from "../../Services/images";
import { formatNumber } from "../../Services/format";
import { useGenres } from "../../Hooks/useCatalogReference";
import { PosterGrid } from "../Movie/PosterGrid";
import { Tabs } from "../UI/Tabs";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { SectionHead } from "../UI/Section";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";
import { SearchBox } from "../Layout/SearchBox";

const TYPES = [
  { value: "all", label: "Everything" },
  { value: "movie", label: "Films" },
  { value: "tv", label: "Series" },
  { value: "person", label: "People" },
  { value: "members", label: "Members" },
];

const BROWSE = [
  { to: "/movies/theatrical", label: "In Cinemas", note: "Showing near you", icon: Popcorn },
  { to: "/movies/ott", label: "Streaming", note: "On your services", icon: MonitorPlay },
  { to: "/discover?list=upcoming&type=movie", label: "Coming Soon", note: "Opening in the weeks ahead", icon: CalendarClock },
  { to: "/discover?list=top_rated&type=movie", label: "Top Rated", note: "The all-time greats", icon: Trophy },
  { to: "/discover?list=hidden_gems&type=movie", label: "Hidden Gems", note: "Loved by the few", icon: Gem },
  { to: "/tvshows", label: "Series", note: "What everyone is bingeing", icon: Clapperboard },
];

function PeopleGrid({ people }) {
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
      {people.map((person) => (
        <li key={person.id}>
          <Link to={`/person/${person.id}`} className="group block text-center">
            <span className="mx-auto flex aspect-square w-full max-w-[120px] items-center justify-center overflow-hidden rounded-full bg-raised text-faint">
              {person.profilePath ? (
                <img src={profileImage(person.profilePath, "w185")} alt="" width="120" height="120" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 can-hover:group-hover:scale-[1.05]" />
              ) : (
                <UserRound size={32} strokeWidth={1.5} aria-hidden="true" />
              )}
            </span>
            <span className="mt-3 block truncate text-[15px] font-medium text-ink can-hover:group-hover:text-accent">{person.name}</span>
            <span className="block truncate text-[13px] text-faint">{person.knownForDepartment === "Directing" ? "Director" : person.knownForDepartment}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MemberResults({ q }) {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["users", "search", q],
    queryFn: () => socialApi.searchUsers(q),
    enabled: q.length >= 2,
  });
  if (isLoading) return <Skeleton className="h-20 w-full rounded-panel" />;
  if (isError) return <ErrorState message="Member search didn't load." onRetry={refetch} />;
  if (!data.length) return <EmptyState title="No members by that name">Usernames are matched from the start, names anywhere.</EmptyState>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((member) => (
        <li key={member.id}>
          <Link to={`/u/${member.username}`} className="flex items-center gap-4 rounded-panel bg-surface p-4 transition-colors can-hover:hover:bg-raised">
            <Avatar user={member} size="lg" />
            <span className="min-w-0">
              <span className="block truncate text-ui font-medium text-ink">{member.name}</span>
              <span className="block truncate text-[13px] text-faint">@{member.username}</span>
              {member.bio && <span className="mt-1 line-clamp-1 block text-[14px] text-muted">{member.bio}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Browse() {
  const { data: genres = [] } = useGenres();
  return (
    <div className="mt-14 space-y-16">
      <section aria-labelledby="browse-title">
        <SectionHead id="browse-title" title="Browse" subtitle="Or start from one of these." />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BROWSE.map(({ to, label, note, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="group flex items-center gap-4 rounded-panel bg-surface p-5 transition-colors can-hover:hover:bg-raised">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-raised text-accent transition-colors can-hover:group-hover:bg-nested"><Icon size={20} aria-hidden="true" /></span>
                <span>
                  <span className="block text-ui font-medium text-ink">{label}</span>
                  <span className="block text-[14px] text-faint">{note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {genres.length > 0 && (
        <section aria-labelledby="genres-title">
          <SectionHead id="genres-title" title="Genres" />
          <ul className="flex flex-wrap gap-2">
            {genres.filter((genre) => genre.mediaTypes.includes("movie")).map((genre) => (
              <li key={genre.id}>
                <Link to={`/discover?type=movie&genre=${genre.id}`} className="inline-flex h-11 items-center rounded-full bg-surface px-5 text-[15px] text-ink transition-colors can-hover:hover:bg-raised">{genre.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const type = params.get("type") || "all";

  const query = useInfiniteQuery({
    queryKey: ["catalog", "search", type, q.toLowerCase()],
    queryFn: ({ pageParam }) => catalogApi.search({ q, type, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled: Boolean(q) && type !== "members",
  });

  const items = query.data?.pages.flatMap((page) => page.items) || [];
  const people = items.filter((item) => item.mediaType === "person");
  const titles = items.filter((item) => item.mediaType !== "person");
  const total = query.data?.pages[0]?.totalResults;

  return (
    <div className="page pb-10 pt-10 md:pt-14">
      <h1 className="display text-h1 leading-[1] text-ink">{q ? <>Results for “{q}”</> : "Search"}</h1>
      {q && type !== "members" && total !== undefined && (
        <p className="num mt-4 text-lead text-muted">{formatNumber(total)} matches across films, series and people</p>
      )}
      <SearchBox key={q} size="lg" className="mt-8 max-w-2xl" autoFocus={!q} />

      {!q ? (
        <Browse />
      ) : (
        <>
          <Tabs className="mt-10" label="Result type" value={type} onChange={(value) => setParams({ q, type: value })} tabs={TYPES} />
          <div className="mt-8">
            {type === "members" ? (
              <MemberResults q={q} />
            ) : query.isLoading ? (
              <PosterGrid loading skeletonCount={12} />
            ) : query.isError ? (
              <ErrorState message="Search didn't load." onRetry={() => query.refetch()} />
            ) : !items.length ? (
              <EmptyState title={`Nothing found for “${q}”`}>Check the spelling, or search for an actor or director instead.</EmptyState>
            ) : (
              <div className="space-y-14">
                {people.length > 0 && (
                  <section aria-label="People">
                    {type === "all" && <h2 className="mb-5 text-h3 font-semibold text-ink">People</h2>}
                    <PeopleGrid people={people} />
                  </section>
                )}
                {titles.length > 0 && (
                  <section aria-label="Films and series">
                    {type === "all" && people.length > 0 && <h2 className="mb-5 text-h3 font-semibold text-ink">Films and Series</h2>}
                    <PosterGrid items={titles} />
                  </section>
                )}
              </div>
            )}
          </div>
          {query.hasNextPage && type !== "members" && (
            <div className="mt-12 flex justify-center">
              <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                {query.isFetchingNextPage ? "Loading…" : "Show More Results"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Search;
