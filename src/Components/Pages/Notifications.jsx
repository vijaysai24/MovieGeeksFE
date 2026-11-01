import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi } from "../../Services/userService";
import { timeAgo } from "../../Services/format";
import { titleHref } from "../../Services/images";
import { AccountShell } from "../Layout/AccountShell";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";
import { Poster } from "../Movie/PosterCard";

const describe = (item) => {
  const who = item.actor?.name || "Someone";
  const what = item.title?.title;
  switch (item.type) {
    case "FOLLOW": return `${who} started following you`;
    case "REVIEW_LIKE": return `${who} found your review of ${what} helpful`;
    case "REVIEW_COMMENT": return `${who} commented on your review of ${what}`;
    case "RELEASE": return `${what} is out now`;
    case "STREAMING": return `${what} is now streaming`;
    case "PARTY_JOIN": return `${who} joined your watch party`;
    case "PARTY_ITEM": return `${who} added ${what} to your watch party`;
    default: return item.message || "New activity";
  }
};

const destination = (item) => {
  if (item.type === "FOLLOW" && item.actor) return `/u/${item.actor.username}`;
  if (item.title) return titleHref(item.title);
  return null;
};

function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: ["me", "notifications", "list"],
    queryFn: ({ pageParam }) => socialApi.notifications({ page: pageParam, limit: 30 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const markRead = useMutation({
    mutationFn: (ids) => socialApi.markRead(ids),
    onSuccess: (result) => {
      queryClient.setQueryData(["me", "notifications", "unread"], result);
      queryClient.invalidateQueries({ queryKey: ["me", "notifications", "list"] });
    },
  });

  const items = query.data?.pages.flatMap((page) => page.items) || [];
  const unread = items.filter((item) => !item.readAt).length;

  const open = (item) => {
    if (!item.readAt) markRead.mutate([item.id]);
    const to = destination(item);
    if (to) navigate(to);
  };

  return (
    <AccountShell
      title="Notifications"
      subtitle={query.isSuccess ? (unread ? `${unread} unread` : "You're all caught up") : " "}
      actions={unread > 0 && <Button variant="secondary" onClick={() => markRead.mutate()} disabled={markRead.isPending}>Mark all as read</Button>}
    >
      {query.isLoading && <div className="space-y-2">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div>}
      {query.isError && <ErrorState message="Notifications didn't load." onRetry={() => query.refetch()} />}
      {query.isSuccess && !items.length && (
        <EmptyState title="Nothing yet">When someone follows you, or likes or comments on a review, it shows up here.</EmptyState>
      )}
      <ul className="max-w-3xl divide-y divide-line">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => open(item)} className="flex w-full items-center gap-4 py-3.5 text-left transition-colors hover:bg-surface/60">
              <span className={`h-2 w-2 flex-none rounded-full ${item.readAt ? "bg-transparent" : "bg-[#dc3532]"}`} aria-label={item.readAt ? undefined : "Unread"} />
              {item.actor ? <Avatar user={item.actor} size="sm" /> : <span className="h-8 w-8 flex-none rounded-full bg-raised" aria-hidden="true" />}
              <span className="min-w-0 flex-1">
                <span className={`block text-[15px] ${item.readAt ? "text-muted" : "text-ink"}`}>{describe(item)}</span>
                {item.message && item.type === "REVIEW_COMMENT" && <span className="block truncate text-[13px] text-faint">"{item.message}"</span>}
              </span>
              <span className="flex-none text-[13px] text-faint">{timeAgo(item.createdAt)}</span>
              {item.title && <span className="w-8 flex-none overflow-hidden rounded-[2px]"><Poster path={item.title.posterPath} title={item.title.title} sizes="32px" /></span>}
            </button>
          </li>
        ))}
      </ul>
      {query.hasNextPage && (
        <div className="mt-6 max-w-3xl">
          <Button variant="secondary" full onClick={() => query.fetchNextPage()}>Older notifications</Button>
        </div>
      )}
    </AccountShell>
  );
}

export default Notifications;
