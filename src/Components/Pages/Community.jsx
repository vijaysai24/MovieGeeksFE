import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ListPlus, MessageSquareText } from "lucide-react";
import { collectionApi, reviewApi, socialApi } from "../../Services/userService";
import { titleHref } from "../../Services/images";
import { plural } from "../../Services/format";
import { useAuth } from "../../Context/AuthContext";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { Segmented, Tabs } from "../UI/Tabs";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";
import { Poster } from "../Movie/PosterCard";
import { ReviewCard } from "../Movie/Reviews";
import { ListCard, ListCardSkeleton, ListGrid } from "../Lists/ListCard";
import { ListFormDialog } from "../Lists/ListFormDialog";

const TABS = [
  { value: "reviews", label: "Reviews" },
  { value: "lists", label: "Lists" },
];

const PERIODS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

function Trending() {
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["community", "trending"], queryFn: () => socialApi.trending({ days: 7 }) });

  return (
    <section aria-labelledby="trending-title" className="rounded-panel bg-surface p-5 md:p-6">
      <h2 id="trending-title" className="text-h3 font-semibold text-ink">Being Talked About</h2>
      <p className="mt-1 text-[14px] text-faint">Most reviewed, discussed and rated this week</p>
      {isLoading && <Skeleton className="mt-5 h-48 w-full" />}
      {isError && <ErrorState className="mt-5" message="Didn't load." onRetry={refetch} />}
      {!isLoading && !isError && !data.length && <p className="mt-5 text-[15px] text-muted">Quiet week so far.</p>}
      <ol className="mt-4">
        {data.slice(0, 8).map((title, index) => (
          <li key={`${title.mediaType}:${title.id}`}>
            <Link to={titleHref(title)} className="group flex items-center gap-3 py-2.5">
              <span className="display num w-6 flex-none text-center text-[1.5rem] leading-none text-faint">{index + 1}</span>
              <span className="w-9 flex-none overflow-hidden rounded-[4px]"><Poster path={title.posterPath} title={title.title} sizes="36px" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-ink can-hover:group-hover:text-accent">{title.title}</span>
                <span className="num block truncate text-[13px] text-faint">
                  {[title.reviews && plural(title.reviews, "review"), title.comments && plural(title.comments, "comment"), title.ratings && plural(title.ratings, "rating")].filter(Boolean).join(" · ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Members() {
  const { data = [], isLoading } = useQuery({ queryKey: ["community", "members"], queryFn: socialApi.members });
  if (isLoading) return <Skeleton className="h-40 w-full rounded-panel" />;
  if (!data.length) return null;

  return (
    <section aria-labelledby="members-title" className="rounded-panel bg-surface p-5 md:p-6">
      <h2 id="members-title" className="text-h3 font-semibold text-ink">Members to Follow</h2>
      <p className="mt-1 text-[14px] text-faint">Writing the reviews people find most helpful</p>
      <ul className="mt-4">
        {data.slice(0, 6).map((member) => (
          <li key={member.id}>
            <Link to={`/u/${member.username}`} className="group flex items-center gap-3 py-2.5">
              <Avatar user={member} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium text-ink can-hover:group-hover:text-accent">{member.name}</span>
                <span className="num block truncate text-[13px] text-faint">{plural(member.reviewCount, "review")} · {plural(member.likesReceived, "like")} received</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewsTab() {
  const [period, setPeriod] = useState("week");
  const query = useInfiniteQuery({
    queryKey: ["reviews", "popular", period],
    queryFn: ({ pageParam }) => reviewApi.popular({ period, page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  const reviews = query.data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-10">
      <section aria-labelledby="popular-title">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="popular-title" className="display text-[clamp(1.75rem,1.3rem+1.3vw,2.375rem)] text-ink">Popular Reviews</h2>
          <Segmented size="sm" label="Period" value={period} onChange={setPeriod} options={PERIODS} />
        </div>
        {query.isLoading && <div className="space-y-3">{[0, 1, 2].map((index) => <Skeleton key={index} className="h-44 w-full rounded-panel" />)}</div>}
        {query.isError && <ErrorState message="Reviews didn't load." onRetry={() => query.refetch()} />}
        {query.isSuccess && !reviews.length && (
          <EmptyState icon={MessageSquareText} title="No reviews in this period">Try a longer period, or be the one to write the first.</EmptyState>
        )}
        <div className="space-y-3">{reviews.map((review) => <ReviewCard key={review.id} review={review} showTitle />)}</div>
        {query.hasNextPage && (
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
              {query.isFetchingNextPage ? "Loading…" : "Show More Reviews"}
            </Button>
          </div>
        )}
      </section>

      <div className="space-y-4">
        <Trending />
        <Members />
      </div>
    </div>
  );
}

function ListsTab() {
  const { isMember } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const query = useInfiniteQuery({
    queryKey: ["collections", "public"],
    queryFn: ({ pageParam }) => collectionApi.publicLists({ page: pageParam, limit: 24 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  const lists = query.data?.pages.flatMap((page) => page.items) || [];

  return (
    <section aria-labelledby="lists-title">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="lists-title" className="display text-[clamp(1.75rem,1.3rem+1.3vw,2.375rem)] text-ink">Lists</h2>
          <p className="mt-2 text-ui text-muted">Films gathered around an idea, by members.</p>
        </div>
        {isMember && <Button variant="primary" onClick={() => setCreating(true)}><ListPlus size={16} aria-hidden="true" /> New List</Button>}
      </div>
      {query.isLoading && <ListGrid>{[0, 1, 2, 3].map((index) => <ListCardSkeleton key={index} />)}</ListGrid>}
      {query.isError && <ErrorState message="Lists didn't load." onRetry={() => query.refetch()} />}
      {query.isSuccess && !lists.length && <EmptyState icon={ListPlus} title="No public lists yet">Make the first one: a mood, a director’s best, a perfect double bill.</EmptyState>}
      {lists.length > 0 && <ListGrid>{lists.map((list) => <ListCard key={list.id} list={list} />)}</ListGrid>}
      {query.hasNextPage && (
        <div className="mt-10 flex justify-center">
          <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>{query.isFetchingNextPage ? "Loading…" : "Show More Lists"}</Button>
        </div>
      )}
      {creating && <ListFormDialog onClose={() => setCreating(false)} onSaved={(list) => navigate(`/lists/${list.id}`)} />}
    </section>
  );
}

function Community() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "lists" ? "lists" : "reviews";

  return (
    <div className="page pb-10 pt-10 md:pt-14">
      <h1 className="display text-h1 leading-[1] text-ink">Community</h1>
      <p className="mt-4 max-w-[56ch] text-lead text-muted">The reviews members found most helpful, the lists they keep, and the films everyone is arguing about.</p>

      <Tabs className="mt-10" label="Community sections" value={tab} onChange={(value) => setParams(value === "reviews" ? {} : { tab: value })} tabs={TABS} />
      <div className="mt-10">{tab === "lists" ? <ListsTab /> : <ReviewsTab />}</div>
    </div>
  );
}

export default Community;
