import { useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { socialApi } from "../../Services/userService";
import { titleHref } from "../../Services/images";
import { timeAgo, plural } from "../../Services/format";
import { AccountShell } from "../Layout/AccountShell";
import { Avatar } from "../UI/Avatar";
import { Button, LinkButton } from "../UI/Button";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";
import { Poster } from "../Movie/PosterCard";

const VERBS = {
  RATED: "rated",
  REVIEWED: "reviewed",
  WATCHED: "watched",
  FAVORITED: "added to favourites",
  LISTED: "made a list",
  FOLLOWED: "started following",
};

function SpoilerExcerpt({ review }) {
  const [open, setOpen] = useState(!review.hasSpoilers);
  if (open) return <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">{review.excerpt}</p>;
  return (
    <button type="button" onClick={() => setOpen(true)} className="mt-2 text-sm text-faint underline-offset-4 hover:text-ink hover:underline">
      Review contains spoilers. Show it
    </button>
  );
}

function FeedItem({ item }) {
  return (
    <li className="flex gap-4 rounded-[14px] bg-surface p-4">
      <Link to={`/u/${item.actor.username}`} className="flex-none"><Avatar user={item.actor} size="md" /></Link>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-muted">
          <Link to={`/u/${item.actor.username}`} className="font-medium text-ink hover:text-accent">{item.actor.name}</Link>{" "}
          {VERBS[item.type]}{" "}
          {item.title && <Link to={titleHref(item.title)} className="text-ink hover:text-accent">{item.title.title}</Link>}
          {item.followed && <Link to={`/u/${item.followed.username}`} className="text-ink hover:text-accent">{item.followed.name}</Link>}
          {item.collection && <span className="text-ink">{item.collection.name}</span>}
          {item.rating && <span className="num"> · <span className="font-semibold text-accent">{item.rating}</span><span className="text-faint"> /10</span></span>}
        </p>
        {item.review && (
          <>
            <SpoilerExcerpt review={item.review} />
            <p className="num mt-2 text-[13px] text-faint">
              {plural(item.review.likeCount, "like")} · {plural(item.review.commentCount, "comment")}
            </p>
          </>
        )}
      </div>
      <div className="flex flex-none flex-col items-end gap-2">
        <span className="text-[13px] text-faint">{timeAgo(item.createdAt)}</span>
        {item.title && (
          <Link to={titleHref(item.title)} className="w-10 overflow-hidden rounded-[3px]">
            <Poster path={item.title.posterPath} title={item.title.title} sizes="40px" />
          </Link>
        )}
      </div>
    </li>
  );
}

function Suggestions() {
  const { data = [], isLoading } = useQuery({ queryKey: ["community", "members"], queryFn: socialApi.members });
  if (isLoading) return <Skeleton className="h-28 w-full" />;
  if (!data.length) return null;
  return (
    <div className="mt-6">
      <h2 className="text-base font-semibold text-ink">Members writing reviews lately</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {data.slice(0, 6).map((member) => (
          <li key={member.id}>
            <Link to={`/u/${member.username}`} className="flex items-center gap-3 rounded-lg bg-surface p-3 hover:bg-raised">
              <Avatar user={member} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{member.name}</span>
                <span className="num block truncate text-[13px] text-faint">{plural(member.reviewCount, "review")} · {plural(member.likesReceived, "like")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Feed() {
  const query = useInfiniteQuery({
    queryKey: ["me", "feed"],
    queryFn: ({ pageParam }) => socialApi.feed({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
  const items = query.data?.pages.flatMap((page) => page.items) || [];

  return (
    <AccountShell title="Following feed" subtitle="What the people you follow have watched, rated and reviewed">
      {query.isLoading && <div className="space-y-2">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-[84px] w-full rounded-[14px]" />)}</div>}
      {query.isError && <ErrorState message="Your feed didn't load." onRetry={() => query.refetch()} />}
      {query.isSuccess && !items.length && (
        <>
          <EmptyState title="Your feed is quiet" action={<LinkButton to="/community" variant="secondary">Find people to follow</LinkButton>}>
            Follow members whose taste you trust and their ratings and reviews show up here.
          </EmptyState>
          <Suggestions />
        </>
      )}
      <ul className="max-w-3xl space-y-2">{items.map((item) => <FeedItem key={item.id} item={item} />)}</ul>
      {query.hasNextPage && (
        <div className="mt-6 max-w-3xl">
          <Button variant="secondary" full onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
            {query.isFetchingNextPage ? "Loading..." : "Older activity"}
          </Button>
        </div>
      )}
    </AccountShell>
  );
}

export default Feed;
