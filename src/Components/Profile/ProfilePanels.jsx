import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { BookOpen, Clapperboard, ListPlus, MessageSquareText, RotateCcw } from "lucide-react";
import { collectionApi, socialApi } from "../../Services/userService";
import { titleHref } from "../../Services/images";
import { formatDate, plural, timeAgo } from "../../Services/format";
import { useAuth } from "../../Context/AuthContext";
import { Poster } from "../Movie/PosterCard";
import { PosterGrid } from "../Movie/PosterGrid";
import { PosterRow } from "../Movie/PosterRow";
import { ReviewCard } from "../Movie/Reviews";
import { ListCard, ListCardSkeleton, ListGrid } from "../Lists/ListCard";
import { ListFormDialog } from "../Lists/ListFormDialog";
import { Button, LinkButton } from "../UI/Button";
import { Select } from "../UI/Field";
import { SectionHead } from "../UI/Section";
import { Segmented } from "../UI/Tabs";
import { EmptyState, ErrorState, Skeleton, SkeletonText } from "../UI/States";
import { TopFive } from "./TopFive";
import { TasteMatch } from "./TasteMatch";

const first = (name) => name.split(" ")[0];

// On someone else's profile their score is labelled as theirs, never shown as the viewer's.
const theirScore = (item, name) => (item.userRating
  ? <span className="truncate">{item.year || "TBA"} · {first(name)} gave it <span className="font-medium text-accent">{item.userRating}</span></span>
  : undefined);

// Every profile list pages the same way.
function useProfileList(username, list, params = {}, limit = 24) {
  const query = useInfiniteQuery({
    queryKey: ["profile", username, list, params],
    queryFn: ({ pageParam }) => socialApi.profileList(username, list, { ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  return { ...query, items: query.data?.pages.flatMap((page) => page.items) || [], total: query.data?.pages[0]?.totalRecords ?? 0 };
}

function MoreButton({ query, noun }) {
  if (!query.hasNextPage) return null;
  return (
    <div className="mt-10 flex justify-center">
      <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
        {query.isFetchingNextPage ? "Loading…" : `Show More ${noun}`}
      </Button>
    </div>
  );
}

function RatingTag({ value }) {
  if (!value) return null;
  return (
    <span className="num flex-none text-[14px]">
      <span className="font-semibold text-accent">{value}</span>
      <span className="text-faint">/10</span>
    </span>
  );
}

/* Overview ------------------------------------------------------------------------------------ */

const ACTIVITY_VERBS = {
  RATED: "Rated",
  REVIEWED: "Reviewed",
  WATCHED: "Watched",
  FAVORITED: "Added to favourites",
  LISTED: "Started a list",
  FOLLOWED: "Followed",
};

function Lately({ username, isSelf }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile", username, "diary", "recent"],
    queryFn: () => socialApi.profileList(username, "diary", { limit: 6 }),
  });

  return (
    <section aria-labelledby="lately-title">
      <SectionHead id="lately-title" title="Lately" href={data?.totalRecords > 6 ? "?tab=diary" : undefined} hrefLabel="Full Diary" />
      {isLoading && <SkeletonText lines={5} />}
      {isError && <ErrorState message="The diary didn't load." onRetry={refetch} />}
      {data && !data.items.length && <p className="text-[15px] text-muted">{isSelf ? "Log a film from its page and it shows up here." : "Nothing logged yet."}</p>}
      {data?.items.length > 0 && (
        <ul className="divide-y divide-line">
          {data.items.map((entry) => (
            <li key={entry.id}>
              <Link to={titleHref(entry.title)} className="group flex items-center gap-4 py-3">
                <span className="w-10 flex-none overflow-hidden rounded-[4px]"><Poster path={entry.title.posterPath} title={entry.title.title} sizes="40px" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink can-hover:group-hover:text-accent">{entry.title.title}</span>
                  <span className="num block text-[13px] text-faint">
                    {formatDate(entry.watchedOn)}{entry.isRewatch ? " · Rewatch" : ""}
                  </span>
                </span>
                <RatingTag value={entry.rating} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Activity({ username }) {
  const { data, isLoading } = useQuery({
    queryKey: ["profile", username, "activity"],
    queryFn: () => socialApi.profileList(username, "activity", { limit: 8 }),
  });
  if (isLoading) return <SkeletonText lines={5} />;
  if (!data?.items.length) return null;

  return (
    <section aria-labelledby="activity-title">
      <SectionHead id="activity-title" title="Recent Activity" />
      <ul className="divide-y divide-line">
        {data.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-3">
            {item.title ? (
              <span className="w-10 flex-none overflow-hidden rounded-[4px]"><Poster path={item.title.posterPath} title={item.title.title} sizes="40px" /></span>
            ) : (
              <span className="flex h-[60px] w-10 flex-none items-center justify-center rounded-[4px] bg-raised text-faint" aria-hidden="true">
                {item.type === "LISTED" ? <ListPlus size={16} /> : <Clapperboard size={16} />}
              </span>
            )}
            <p className="min-w-0 flex-1 text-[15px] text-muted">
              {ACTIVITY_VERBS[item.type]}{" "}
              {item.title && <Link to={titleHref(item.title)} className="font-medium text-ink can-hover:hover:text-accent">{item.title.title}</Link>}
              {item.collection && <Link to={`/lists/${item.collection.id}`} className="font-medium text-ink can-hover:hover:text-accent">{item.collection.name}</Link>}
              {item.followed && <Link to={`/u/${item.followed.username}`} className="font-medium text-ink can-hover:hover:text-accent">{item.followed.name}</Link>}
              {item.rating && <span className="num font-medium text-accent"> {item.rating}/10</span>}
            </p>
            <span className="flex-none text-[13px] text-faint">{timeAgo(item.createdAt)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Favourites({ username, name, isSelf }) {
  const { data, isLoading } = useQuery({
    queryKey: ["profile", username, "favorites"],
    queryFn: () => socialApi.profileList(username, "favorites", { limit: 20 }),
  });
  if (!isLoading && !data?.items.length) return null;
  return (
    <PosterRow
      title="Favourites"
      subtitle={isSelf ? "Everything you've starred." : `Everything ${first(name)} has starred.`}
      items={data?.items}
      loading={isLoading}
      ratingOf={isSelf ? (item) => item.userRating : undefined}
      sublineOf={isSelf ? undefined : (item) => theirScore(item, name)}
    />
  );
}

function RecentReviews({ username, name, isSelf }) {
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", "user", username, "recent"],
    queryFn: () => socialApi.profileList(username, "reviews", { limit: 2 }),
  });
  if (isLoading) return <Skeleton className="h-40 w-full rounded-panel" />;
  if (!data?.items.length) return null;

  return (
    <section aria-labelledby="recent-reviews-title">
      <SectionHead
        id="recent-reviews-title"
        title={isSelf ? "Your Latest Reviews" : `${first(name)}'s Latest Reviews`}
        href={data.totalRecords > 2 ? "?tab=reviews" : undefined}
        hrefLabel={`All ${data.totalRecords}`}
      />
      <div className="space-y-3">{data.items.map((review) => <ReviewCard key={review.id} review={review} showTitle />)}</div>
    </section>
  );
}

export function OverviewPanel({ profile, onEditFive }) {
  const { isMember } = useAuth();
  const { user, counts } = profile;
  const quiet = !counts.watched && !counts.reviews && !counts.diary && !profile.topFive.length;

  return (
    <div className="space-y-20 md:space-y-24">
      <TopFive profile={profile} onEdit={onEditFive} />
      {!profile.isSelf && isMember && <TasteMatch username={user.username} name={user.name} />}
      {quiet ? (
        <EmptyState icon={Clapperboard} title={profile.isSelf ? "Your profile fills in as you watch" : "Nothing here yet"} action={profile.isSelf && <LinkButton to="/discover" variant="primary">Find Something to Watch</LinkButton>}>
          {profile.isSelf ? "Rate, log or review anything and it shows up here." : `${first(user.name)} hasn't logged anything yet.`}
        </EmptyState>
      ) : (
        <>
          {/* Someone else's empty diary isn't worth a column; their activity takes the width. */}
          {profile.isSelf || counts.diary > 0 ? (
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
              <Lately username={user.username} isSelf={profile.isSelf} />
              <Activity username={user.username} />
            </div>
          ) : (
            <Activity username={user.username} />
          )}
          <Favourites username={user.username} name={user.name} isSelf={profile.isSelf} />
          <RecentReviews username={user.username} name={user.name} isSelf={profile.isSelf} />
        </>
      )}
    </div>
  );
}

/* Diary --------------------------------------------------------------------------------------- */

const monthOf = (date) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

export function DiaryPanel({ username, name, isSelf }) {
  const query = useProfileList(username, "diary", {}, 30);
  const groups = [];
  for (const entry of query.items) {
    const month = monthOf(entry.watchedOn);
    if (groups.at(-1)?.month !== month) groups.push({ month, entries: [] });
    groups.at(-1).entries.push(entry);
  }

  if (query.isLoading) return <SkeletonText lines={8} />;
  if (query.isError) return <ErrorState message="The diary didn't load." onRetry={query.refetch} />;
  if (!query.items.length) {
    return (
      <EmptyState icon={BookOpen} title="No diary entries yet" action={isSelf && <LinkButton to="/discover" variant="primary">Find a Film to Log</LinkButton>}>
        {isSelf ? "Every time you log a viewing it lands here, dated, with your rating and notes." : `${first(name)} hasn't logged a viewing yet.`}
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="num text-ui text-muted">{plural(query.total, "entry", "entries")}</p>
        {isSelf && <LinkButton to="/diary" variant="secondary">Edit in Your Diary</LinkButton>}
      </div>
      <div className="space-y-12">
        {groups.map((group) => (
          <section key={group.month} aria-label={group.month}>
            <h3 className="display text-[1.625rem] text-ink">{group.month}</h3>
            <ul className="mt-3 divide-y divide-line">
              {group.entries.map((entry) => (
                <li key={entry.id}>
                  <Link to={titleHref(entry.title)} className="group grid grid-cols-[2.5rem_2.75rem_minmax(0,1fr)_auto] items-center gap-4 py-3.5 md:grid-cols-[3rem_3rem_minmax(0,1fr)_auto]">
                    <span className="num text-center">
                      <span className="block text-[1.5rem] font-semibold leading-none text-ink">{Number(entry.watchedOn.slice(8, 10))}</span>
                    </span>
                    <span className="overflow-hidden rounded-[4px]"><Poster path={entry.title.posterPath} title={entry.title.title} sizes="48px" /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-ui font-medium text-ink can-hover:group-hover:text-accent">
                        {entry.title.title} <span className="num font-normal text-faint">{entry.title.year}</span>
                      </span>
                      {entry.isRewatch && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-faint"><RotateCcw size={12} aria-hidden="true" /> Rewatch</span>
                      )}
                      {entry.note && <span className="mt-1 line-clamp-2 block text-[14px] text-muted">{entry.note}</span>}
                    </span>
                    <RatingTag value={entry.rating} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <MoreButton query={query} noun="Entries" />
    </div>
  );
}

/* Lists --------------------------------------------------------------------------------------- */

export function ListsPanel({ username, name, isSelf }) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const query = useInfiniteQuery({
    queryKey: ["collections", "user", username],
    queryFn: ({ pageParam }) => collectionApi.userLists(username, { page: pageParam, limit: 24 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  const lists = query.data?.pages.flatMap((page) => page.items) || [];

  return (
    <div>
      {isSelf && (
        <div className="mb-8 flex justify-end">
          <Button variant="primary" onClick={() => setCreating(true)}><ListPlus size={16} aria-hidden="true" /> New List</Button>
        </div>
      )}
      {query.isLoading && <ListGrid>{[0, 1, 2, 3].map((index) => <ListCardSkeleton key={index} />)}</ListGrid>}
      {query.isError && <ErrorState message="Lists didn't load." onRetry={query.refetch} />}
      {query.isSuccess && !lists.length && (
        <EmptyState icon={ListPlus} title="No lists yet">
          {isSelf ? "Gather films around an idea: a director's best, a mood, a double bill. Lists can be public or private." : `${first(name)} hasn't made a public list yet.`}
        </EmptyState>
      )}
      {lists.length > 0 && <ListGrid>{lists.map((list) => <ListCard key={list.id} list={list} showAuthor={false} />)}</ListGrid>}
      <MoreButton query={query} noun="Lists" />
      {creating && <ListFormDialog onClose={() => setCreating(false)} onSaved={(list) => navigate(`/lists/${list.id}`)} />}
    </div>
  );
}

/* Reviews ------------------------------------------------------------------------------------- */

export function ReviewsPanel({ username, name, isSelf }) {
  const query = useProfileList(username, "reviews", {}, 10);

  if (query.isLoading) return <div className="space-y-3">{[0, 1].map((index) => <Skeleton key={index} className="h-40 w-full rounded-panel" />)}</div>;
  if (query.isError) return <ErrorState message="Reviews didn't load." onRetry={query.refetch} />;
  if (!query.items.length) {
    return (
      <EmptyState icon={MessageSquareText} title="No reviews yet">
        {isSelf ? "Write about anything you've seen from its page. Your reviews collect here." : `${first(name)} hasn't reviewed anything yet.`}
      </EmptyState>
    );
  }

  return (
    <div className="max-w-3xl">
      <p className="num mb-6 text-ui text-muted">{plural(query.total, "review")}</p>
      <div className="space-y-3">{query.items.map((review) => <ReviewCard key={review.id} review={review} showTitle />)}</div>
      <MoreButton query={query} noun="Reviews" />
    </div>
  );
}

/* Watchlist ----------------------------------------------------------------------------------- */

const SHELVES = [
  { value: "WATCHING", label: "Watching", count: "watching" },
  { value: "PLAN_TO_WATCH", label: "Plan to Watch", count: "planToWatch" },
  { value: "WATCHED", label: "Watched", count: "watched" },
];

const SORTS = [
  ["recent", "Recently added"],
  ["rating", "Their rating"],
  ["release", "Release date"],
  ["title", "Title A–Z"],
];

export function WatchlistPanel({ profile }) {
  const { user, counts, isSelf } = profile;
  const [status, setStatus] = useState(() => SHELVES.find((shelf) => counts[shelf.count] > 0)?.value || "WATCHED");
  const [sort, setSort] = useState("recent");
  const query = useProfileList(user.username, "library", { status, sort }, 30);
  const shelf = SHELVES.find((item) => item.value === status);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Segmented
          label="Shelf"
          value={status}
          onChange={setStatus}
          options={SHELVES.map((item) => ({ value: item.value, label: `${item.label} ${counts[item.count] ?? ""}`.trim() }))}
        />
        <label htmlFor="shelf-sort" className="sr-only">Sort</label>
        <Select id="shelf-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="ml-auto">
          {SORTS.map(([value, label]) => <option key={value} value={value}>{value === "rating" && isSelf ? "Your rating" : label}</option>)}
        </Select>
        {isSelf && <LinkButton to="/watchlist" variant="ghost">Open Library</LinkButton>}
      </div>

      {query.isError && <ErrorState message="This shelf didn't load." onRetry={query.refetch} />}
      {query.isSuccess && !query.items.length ? (
        <EmptyState icon={Clapperboard} title={`Nothing in ${shelf.label} yet`}>
          {isSelf ? "Set a title's status from its page and it lands on the right shelf." : `${first(user.name)} hasn't put anything here yet.`}
        </EmptyState>
      ) : (
        <PosterGrid
          items={query.items}
          loading={query.isLoading}
          ratingOf={isSelf ? (item) => item.userRating : undefined}
          renderSubline={isSelf ? undefined : (item) => theirScore(item, user.name)}
        />
      )}
      <MoreButton query={query} noun="Titles" />
    </div>
  );
}
