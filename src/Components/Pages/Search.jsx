import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { catalogApi } from "../../Services/catalogService";
import { socialApi } from "../../Services/userService";
import { profileImage, tmdbImage } from "../../Services/images";
import { formatNumber } from "../../Services/format";
import { genreNames, useGenres } from "../../Hooks/useCatalogReference";
import { Tabs } from "../UI/Tabs";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";
import { SearchBox } from "../Layout/SearchBox";

const TYPES = [
  { value: "all", label: "Everything" },
  { value: "movie", label: "Films" },
  { value: "tv", label: "Series" },
  { value: "person", label: "People" },
  { value: "members", label: "Members" },
];

function ResultRow({ item, genres }) {
  if (item.mediaType === "person") {
    return (
      <Link to={`/person/${item.id}`} className="flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-surface">
        {item.profilePath ? (
          <img src={profileImage(item.profilePath, "w185")} alt="" width="56" height="56" loading="lazy" className="h-14 w-14 flex-none rounded-full bg-raised object-cover" />
        ) : (
          <span className="h-14 w-14 flex-none rounded-full bg-raised" aria-hidden="true" />
        )}
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-medium text-ink">{item.name}</span>
          <span className="block truncate text-[13px] text-faint">
            {[item.knownForDepartment, item.knownFor.join(", ")].filter(Boolean).join(" · ")}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link to={`/${item.mediaType}/${item.id}`} className="flex items-start gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-surface">
      {item.posterPath ? (
        <img src={tmdbImage(item.posterPath, "w185")} alt="" width="56" height="84" loading="lazy" className="h-[84px] w-14 flex-none rounded-[3px] bg-raised object-cover" />
      ) : (
        <span className="h-[84px] w-14 flex-none rounded-[3px] bg-raised" aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-ink">{item.title}</span>
        <span className="num block truncate text-[13px] text-faint">
          {[item.year || "TBA", item.mediaType === "tv" ? "Series" : "Film", genreNames(item.genreIds, genres).slice(0, 2).join(", "), item.rating && `TMDB ${item.rating.toFixed(1)}`]
            .filter(Boolean)
            .join(" · ")}
        </span>
        {item.overview && <span className="mt-1.5 line-clamp-2 block text-sm text-muted">{item.overview}</span>}
      </span>
    </Link>
  );
}

function MemberResults({ q }) {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["users", "search", q],
    queryFn: () => socialApi.searchUsers(q),
    enabled: q.length >= 2,
  });
  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (isError) return <ErrorState message="Member search didn't load." onRetry={refetch} />;
  if (!data.length) return <EmptyState title="No members by that name">Usernames are matched from the start, names anywhere.</EmptyState>;
  return (
    <ul>
      {data.map((member) => (
        <li key={member.id}>
          <Link to={`/u/${member.username}`} className="flex items-center gap-4 rounded-lg px-2 py-3 hover:bg-surface">
            <Avatar user={member} size="md" />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-medium text-ink">{member.name}</span>
              <span className="block truncate text-[13px] text-faint">@{member.username}{member.bio && ` · ${member.bio}`}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const type = params.get("type") || "all";
  const { data: genres = [] } = useGenres();

  const query = useInfiniteQuery({
    queryKey: ["catalog", "search", type, q.toLowerCase()],
    queryFn: ({ pageParam }) => catalogApi.search({ q, type, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled: Boolean(q) && type !== "members",
  });

  const items = query.data?.pages.flatMap((page) => page.items) || [];
  const total = query.data?.pages[0]?.totalResults;

  return (
    <div className="mx-auto max-w-[960px] px-4 pb-10 pt-8 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{q ? `Results for "${q}"` : "Search"}</h1>
      {q && type !== "members" && total !== undefined && (
        <p className="num mt-1 text-[15px] text-muted">{formatNumber(total)} matches across films, series and people</p>
      )}
      <SearchBox className="mt-5 md:hidden" />

      {!q ? (
        <EmptyState className="mt-8" title="Search for a film, a series or a person">
          Try a title, an actor, a director, or a member's username.
        </EmptyState>
      ) : (
        <>
          <Tabs className="mt-6" label="Result type" value={type} onChange={(value) => setParams({ q, type: value })} tabs={TYPES} />
          <div className="mt-4">
            {type === "members" ? (
              <MemberResults q={q} />
            ) : query.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-[100px] w-full" />)}</div>
            ) : query.isError ? (
              <ErrorState message="Search didn't load." onRetry={() => query.refetch()} />
            ) : !items.length ? (
              <EmptyState title={`Nothing found for "${q}"`}>Check the spelling, or search by an actor or director instead.</EmptyState>
            ) : (
              <ul>{items.map((item) => <li key={`${item.mediaType}:${item.id}`}><ResultRow item={item} genres={genres} /></li>)}</ul>
            )}
          </div>
          {query.hasNextPage && type !== "members" && (
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                {query.isFetchingNextPage ? "Loading..." : "More results"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Search;
