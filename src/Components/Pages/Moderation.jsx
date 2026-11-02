import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moderationApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { timeAgo, plural } from "../../Services/format";
import { useToast } from "../../Context/ToastContext";
import { AccountShell } from "../Layout/AccountShell";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { Tabs } from "../UI/Tabs";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";

const REASONS = {
  SPOILERS: "Unmarked spoilers",
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  HATE: "Hate speech",
  OTHER: "Other",
};

const STATUS_PILL = {
  PUBLISHED: "bg-[#172a1d] text-positive",
  HIDDEN: "bg-[#2a2310] text-[#f0cf86]",
  REMOVED: "bg-[#2c1a20] text-negative",
};

function Moderation() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "OPEN";
  const toast = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ["moderation", status], queryFn: () => moderationApi.reports({ status, limit: 50 }) });

  const act = useMutation({
    mutationFn: (body) => moderationApi.act(body),
    onSuccess: (result) => {
      toast.show(`${result.action.toLowerCase()} done, ${plural(result.reportsClosed, "report")} closed`);
      queryClient.invalidateQueries({ queryKey: ["moderation"] });
    },
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  const ban = useMutation({
    mutationFn: (username) => moderationApi.setUserStatus(username, "BANNED"),
    onSuccess: (result) => toast.show(`@${result.username} is banned and signed out`),
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  const items = query.data?.items || [];

  return (
    <AccountShell
      title="Moderation"
      subtitle={query.isSuccess ? (status === "OPEN" ? `${plural(query.data.totalRecords, "item")} waiting for a decision` : `${plural(query.data.totalRecords, "item")}`) : " "}
    >
      <Tabs
        label="Report status"
        value={status}
        onChange={(value) => setParams({ status: value })}
        tabs={[{ value: "OPEN", label: "Waiting" }, { value: "RESOLVED", label: "Acted on" }, { value: "DISMISSED", label: "Dismissed" }]}
      />

      <div className="mt-6">
        {query.isLoading && <Skeleton className="h-40 w-full" />}
        {query.isError && <ErrorState message="The queue didn't load." onRetry={() => query.refetch()} />}
        {query.isSuccess && !items.length && (
          <EmptyState title={status === "OPEN" ? "Nothing waiting" : "Nothing here"}>
            {status === "OPEN" ? "Reported reviews and comments land here. Anything reported by three members is hidden until you decide." : "Decisions you make move items here."}
          </EmptyState>
        )}

        <ul className="max-w-4xl space-y-3">
          {items.map((item) => (
            <li key={`${item.targetType}:${item.targetId}`} className="rounded-panel bg-surface p-5">
              <div className="flex flex-wrap items-center gap-3 text-[13px]">
                <span className="text-ink">{item.targetType === "REVIEW" ? "Review" : "Comment"}</span>
                {item.title && (
                  <span className="text-faint">on <Link to={`/${item.title.mediaType}/${item.title.id}`} className="text-muted can-hover:hover:text-ink">{item.title.title}</Link></span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${STATUS_PILL[item.contentStatus] || "bg-raised text-muted"}`}>
                  {item.contentStatus?.toLowerCase()}
                </span>
                <span className="num ml-auto text-faint">{plural(item.reportCount, "report")} · last {timeAgo(item.lastReportedAt)}</span>
              </div>
              <p className="mt-2 text-[13px] text-faint">{item.reasons.map((reason) => REASONS[reason] || reason).join(", ")}</p>

              {item.author && (
                <div className="mt-4 flex items-center gap-2">
                  <Avatar user={item.author} size="xs" />
                  <Link to={`/u/${item.author.username}`} className="text-sm text-ink can-hover:hover:text-accent">{item.author.name}</Link>
                  <span className="text-[13px] text-faint">@{item.author.username}</span>
                </div>
              )}
              <p className="mt-2 whitespace-pre-line break-words rounded-control bg-raised p-3 text-sm leading-relaxed text-ink">
                {item.content || "This content was deleted by its author."}
              </p>

              {status === "OPEN" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => act.mutate({ targetType: item.targetType, targetId: item.targetId, action: "DISMISS" })}>
                    Dismiss{item.contentStatus === "HIDDEN" ? " and Restore" : ""}
                  </Button>
                  {item.contentStatus !== "HIDDEN" && (
                    <Button size="sm" variant="secondary" onClick={() => act.mutate({ targetType: item.targetType, targetId: item.targetId, action: "HIDE" })}>Hide</Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => act.mutate({ targetType: item.targetType, targetId: item.targetId, action: "REMOVE" })}>Remove</Button>
                  {item.author && (
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => window.confirm(`Ban @${item.author.username}? They will be signed out and can't sign in again.`) && ban.mutate(item.author.username)}>
                      Ban @{item.author.username}
                    </Button>
                  )}
                </div>
              )}
              {status !== "OPEN" && item.contentStatus !== "PUBLISHED" && item.contentStatus !== "REMOVED" && (
                <Button size="sm" variant="secondary" className="mt-4" onClick={() => act.mutate({ targetType: item.targetType, targetId: item.targetId, action: "RESTORE" })}>Restore</Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </AccountShell>
  );
}

export default Moderation;
