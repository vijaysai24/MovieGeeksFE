import { useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { reviewApi, socialApi } from "../../Services/userService";
import { titleHref } from "../../Services/images";
import { plural } from "../../Services/format";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { Tabs } from "../UI/Tabs";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";
import { Poster } from "../Movie/PosterCard";
import { ReviewCard } from "../Movie/Reviews";

const PERIODS = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

function Trending() {
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["community", "trending"], queryFn: () => socialApi.trending({ days: 7 }) });

  return (
    <section aria-labelledby="trending-title">
      <h2 id="trending-title" className="text-lg font-semibold text-ink">Being talked about</h2>
      <p className="mt-1 text-sm text-faint">Most reviewed, discussed and rated in the last seven days</p>
      {isLoading && <Skeleton className="mt-4 h-48 w-full" />}
      {isError && <ErrorState className="mt-4" message="Didn't load." onRetry={refetch} />}
      {!isLoading && !isError && !data.length && <p className="mt-4 text-sm text-muted">Quiet week so far.</p>}
      <ol className="mt-4 space-y-1">
        {data.slice(0, 10).map((title) => (
          <li key={`${title.mediaType}:${title.id}`}>
            <Link to={titleHref(title)} className="flex items-center gap-3 rounded-lg py-2 hover:bg-surface">
              <span className="w-9 flex-none overflow-hidden rounded-[3px]"><Poster path={title.posterPath} title={title.title} sizes="36px" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] text-ink">{title.title}</span>
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
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!data.length) return null;

  return (
    <section aria-labelledby="members-title">
      <h2 id="members-title" className="text-lg font-semibold text-ink">Members to follow</h2>
      <p className="mt-1 text-sm text-faint">Writing the reviews people find most helpful</p>
      <ul className="mt-4 space-y-1">
        {data.slice(0, 8).map((member) => (
          <li key={member.id}>
            <Link to={`/u/${member.username}`} className="flex items-center gap-3 rounded-lg py-2 hover:bg-surface">
              <Avatar user={member} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-[15px] text-ink">{member.name}</span>
                <span className="num block truncate text-[13px] text-faint">{plural(member.reviewCount, "review")} · {plural(member.likesReceived, "like")} received</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Community() {
  const [period, setPeriod] = useState("week");
  const query = useInfiniteQuery({
    queryKey: ["reviews", "popular", period],
    queryFn: ({ pageParam }) => reviewApi.popular({ period, page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  const reviews = query.data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-8 md:px-8">
      <h1 className="display text-[clamp(2.75rem,5vw,4rem)] text-ink">Community</h1>
      <p className="mt-3 max-w-[52ch] text-base text-muted">The reviews members found most helpful, and the films everyone is arguing about.</p>

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="popular-title">
          <h2 id="popular-title" className="text-lg font-semibold text-ink">Popular reviews</h2>
          <Tabs className="mt-3" label="Period" value={period} onChange={setPeriod} tabs={PERIODS} />
          {query.isLoading && <div className="space-y-4 pt-6">{[0, 1, 2].map((index) => <Skeleton key={index} className="h-40 w-full" />)}</div>}
          {query.isError && <ErrorState className="mt-6" message="Reviews didn't load." onRetry={() => query.refetch()} />}
          {query.isSuccess && !reviews.length && (
            <EmptyState className="mt-6" title="No reviews in this period">Try a longer period, or be the one to write the first.</EmptyState>
          )}
          <div className="max-w-3xl">{reviews.map((review) => <ReviewCard key={review.id} review={review} showTitle />)}</div>
          {query.hasNextPage && (
            <Button variant="secondary" full className="mt-4 max-w-3xl" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
              More reviews
            </Button>
          )}
        </section>

        <div className="space-y-14">
          <Trending />
          <Members />
        </div>
      </div>
    </div>
  );
}

export default Community;
