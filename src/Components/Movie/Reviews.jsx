import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, MessageCircle, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { reviewApi, socialApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { timeAgo, plural } from "../../Services/format";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { titleStateKey } from "../../Hooks/useTitleActions";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { TextArea } from "../UI/Field";
import { RatingValue } from "../UI/RatingInput";
import { Tabs } from "../UI/Tabs";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";
import { Poster } from "./PosterCard";

const REPORT_REASONS = [
  ["SPOILERS", "Unmarked spoilers"],
  ["SPAM", "Spam or advertising"],
  ["HARASSMENT", "Harassment or bullying"],
  ["HATE", "Hate speech"],
  ["OTHER", "Something else"],
];

function ReportDialog({ target, onClose }) {
  const toast = useToast();
  const [reason, setReason] = useState("SPOILERS");
  const [details, setDetails] = useState("");
  const mutation = useMutation({
    mutationFn: () => socialApi.report({ ...target, reason, details: details.trim() || null }),
    onSuccess: (result) => {
      toast.show(result.alreadyReported ? "You've already reported this" : "Thanks, a moderator will take a look");
      onClose();
    },
  });

  return (
    <Dialog open onClose={onClose} title={target.targetType === "REVIEW" ? "Report this review" : "Report this comment"} size="sm">
      <form onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm text-muted">What's wrong with it?</legend>
          {REPORT_REASONS.map(([value, label]) => (
            <label key={value} className="flex items-center gap-3 text-sm text-ink">
              <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} className="accent-[#f5b02e]" />
              {label}
            </label>
          ))}
        </fieldset>
        <TextArea aria-label="Details (optional)" placeholder="Anything a moderator should know (optional)" maxLength={500} value={details} onChange={(event) => setDetails(event.target.value)} className="min-h-20" />
        {mutation.isError && <p className="text-sm text-negative">{errorMessage(mutation.error)}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>Send report</Button>
        </div>
      </form>
    </Dialog>
  );
}

function Comments({ review }) {
  const { isMember } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [reporting, setReporting] = useState(null);
  const key = ["reviews", "comments", review.id];
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: key, queryFn: () => reviewApi.comments(review.id, { limit: 50 }) });

  const post = useMutation({
    mutationFn: () => reviewApi.comment(review.id, body.trim()),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => reviewApi.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  return (
    <div className="mt-4 rounded-lg bg-raised p-4">
      {isLoading && <Skeleton className="h-10 w-full" />}
      {isError && <ErrorState message="Comments didn't load." onRetry={refetch} />}
      {data && !data.items.length && <p className="text-sm text-faint">No comments yet.</p>}
      <ul className="space-y-4">
        {data?.items.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <Avatar user={comment.author} size="xs" className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-faint">
                <Link to={`/u/${comment.author.username}`} className="font-medium text-ink hover:text-accent">{comment.author.name}</Link>
                {" · "}{timeAgo(comment.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-ink">{comment.body}</p>
            </div>
            {isMember && (
              comment.isOwn || review.isOwn ? (
                <button type="button" aria-label="Delete comment" onClick={() => remove.mutate(comment.id)} className="self-start rounded-full p-1.5 text-faint hover:text-ink">
                  <Trash2 size={14} />
                </button>
              ) : (
                <button type="button" aria-label="Report comment" onClick={() => setReporting({ targetType: "COMMENT", targetId: comment.id })} className="self-start rounded-full p-1.5 text-faint hover:text-ink">
                  <Flag size={14} />
                </button>
              )
            )}
          </li>
        ))}
      </ul>
      {isMember ? (
        <form onSubmit={(event) => { event.preventDefault(); if (body.trim()) post.mutate(); }} className="mt-4 flex items-end gap-2">
          <TextArea aria-label="Write a comment" placeholder="Add to the conversation" maxLength={1000} value={body} onChange={(event) => setBody(event.target.value)} className="min-h-11 flex-1 resize-none py-2.5" rows={1} />
          <Button type="submit" variant="primary" size="md" disabled={!body.trim() || post.isPending}>Post</Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-faint"><Link to="/login" className="text-ink hover:text-accent">Sign in</Link> to join the conversation.</p>
      )}
      {post.isError && <p className="mt-2 text-sm text-negative">{errorMessage(post.error)}</p>}
      {reporting && <ReportDialog target={reporting} onClose={() => setReporting(null)} />}
    </div>
  );
}

export function ReviewCard({ review, showTitle = false, onChanged }) {
  const { isMember } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [revealed, setRevealed] = useState(!review.hasSpoilers);
  const [showComments, setShowComments] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [local, setLocal] = useState(null);
  const current = local || review;

  const react = useMutation({
    mutationFn: (reaction) => (current.viewerReaction === reaction ? reviewApi.unreact(review.id) : reviewApi.react(review.id, reaction)),
    onSuccess: (updated) => {
      setLocal(updated);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      onChanged?.();
    },
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  const onReact = (reaction) => {
    if (!isMember) {
      toast.show("Sign in to react to reviews");
      navigate("/login", { state: { from: location } });
      return;
    }
    react.mutate(reaction);
  };

  return (
    <article className="py-7">
      <header className="flex items-center gap-3">
        <Link to={`/u/${current.author.username}`} className="flex min-w-0 items-center gap-3">
          <Avatar user={current.author} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink hover:text-accent">{current.author.name}</span>
            <span className="block text-[13px] text-faint">
              {timeAgo(current.createdAt)}{current.edited && " · edited"}
            </span>
          </span>
        </Link>
        {current.authorRating && <RatingValue value={current.authorRating} className="ml-auto text-sm" />}
      </header>

      {showTitle && current.title && (
        <Link to={`/${current.title.mediaType}/${current.title.id}`} className="mt-4 flex items-center gap-3">
          <span className="w-10 flex-none overflow-hidden rounded-[3px]"><Poster path={current.title.posterPath} title={current.title.title} sizes="40px" /></span>
          <span className="text-[15px] text-ink hover:text-accent">{current.title.title} <span className="text-faint">{current.title.year}</span></span>
        </Link>
      )}

      {current.status === "HIDDEN" && (
        <p className="mt-4 rounded-lg bg-[#2a2310] px-3 py-2 text-[13px] text-[#f0cf86]">
          Hidden while moderators review reports. Only you can see it.
        </p>
      )}

      <div className="relative mt-4">
        <p className={`whitespace-pre-line break-words text-base leading-relaxed text-ink transition-[filter] duration-300 ${revealed ? "" : "max-h-28 select-none overflow-hidden blur-[7px]"}`} aria-hidden={!revealed}>
          {current.body}
        </p>
        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="absolute inset-0 m-auto h-9 w-fit rounded-full bg-ink px-4 text-sm font-medium text-ground transition-transform active:scale-95"
          >
            Contains spoilers · Show review
          </button>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-1 text-[13px]">
        <button
          type="button"
          onClick={() => onReact("LIKE")}
          disabled={current.isOwn}
          aria-pressed={current.viewerReaction === "LIKE"}
          className={`num inline-flex h-8 items-center gap-1.5 rounded-full px-3 transition-colors disabled:cursor-default ${current.viewerReaction === "LIKE" ? "bg-ink text-ground" : "text-muted hover:bg-white/[0.06] hover:text-ink"}`}
        >
          <ThumbsUp size={14} aria-hidden="true" />
          <span>{current.likeCount}</span>
          <span className="sr-only">found this helpful</span>
        </button>
        <button
          type="button"
          onClick={() => onReact("DISLIKE")}
          disabled={current.isOwn}
          aria-pressed={current.viewerReaction === "DISLIKE"}
          aria-label="Not helpful"
          className={`num inline-flex h-8 items-center gap-1.5 rounded-full px-3 transition-colors disabled:cursor-default ${current.viewerReaction === "DISLIKE" ? "bg-ink text-ground" : "text-muted hover:bg-white/[0.06] hover:text-ink"}`}
        >
          <ThumbsDown size={14} aria-hidden="true" />
          {current.dislikeCount > 0 && <span>{current.dislikeCount}</span>}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((value) => !value)}
          aria-expanded={showComments}
          className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
        >
          <MessageCircle size={14} aria-hidden="true" />
          {current.commentCount ? plural(current.commentCount, "comment") : "Comment"}
        </button>
        {isMember && !current.isOwn && (
          <button type="button" onClick={() => setReporting(true)} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-faint hover:text-ink">
            <Flag size={13} aria-hidden="true" /> Report
          </button>
        )}
      </footer>

      {showComments && <Comments review={current} />}
      {reporting && <ReportDialog target={{ targetType: "REVIEW", targetId: review.id }} onClose={() => setReporting(false)} />}
    </article>
  );
}

function Composer({ title, existing, currentRating, onDone }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [body, setBody] = useState(existing?.body || "");
  const [hasSpoilers, setHasSpoilers] = useState(existing?.hasSpoilers || false);

  const save = useMutation({
    mutationFn: () => reviewApi.save(title.mediaType, title.id, { body: body.trim(), hasSpoilers }),
    onSuccess: () => {
      toast.show(existing ? "Review updated" : "Review posted");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: titleStateKey(title.mediaType, title.id) });
      queryClient.invalidateQueries({ queryKey: ["community", title.mediaType, title.id] });
      onDone();
    },
  });

  const remove = useMutation({
    mutationFn: () => reviewApi.remove(title.mediaType, title.id),
    onSuccess: () => {
      toast.show("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: titleStateKey(title.mediaType, title.id) });
      onDone();
    },
  });

  return (
    <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="rounded-lg bg-surface p-5">
      <label htmlFor="review-body" className="text-sm font-medium text-ink">
        {existing ? "Edit your review" : `Your review of ${title.title}`}
      </label>
      <TextArea
        id="review-body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        minLength={3}
        maxLength={8000}
        required
        placeholder="What worked, what didn't, what stayed with you"
        className="mt-3 min-h-36"
        aria-describedby="review-hint"
      />
      <p id="review-hint" className="mt-2 text-[13px] text-faint">
        {currentRating ? `Shown with your rating of ${currentRating} /10. ` : "Rate it above and your score shows with the review. "}
        {body.length}/8000
      </p>
      <label className="mt-4 flex items-center gap-3 text-sm text-ink">
        <input type="checkbox" checked={hasSpoilers} onChange={(event) => setHasSpoilers(event.target.checked)} className="h-4 w-4 accent-[#f5b02e]" />
        This review contains spoilers
      </label>
      {(save.isError || remove.isError) && <p className="mt-3 text-sm text-negative" role="alert">{errorMessage(save.error || remove.error)}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={save.isPending || body.trim().length < 3}>
          {save.isPending ? "Saving..." : existing ? "Save changes" : "Post review"}
        </Button>
        {existing && (
          <Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>Delete review</Button>
        )}
        <Button variant="ghost" onClick={onDone} className="ml-auto">Cancel</Button>
      </div>
    </form>
  );
}

export function TitleReviews({ title, viewerState }) {
  const { isMember } = useAuth();
  const [sort, setSort] = useState("popular");
  const [composing, setComposing] = useState(false);

  const query = useInfiniteQuery({
    queryKey: ["reviews", "title", title.mediaType, title.id, sort],
    queryFn: ({ pageParam }) => reviewApi.forTitle(title.mediaType, title.id, { sort, page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const own = useQuery({
    queryKey: ["reviews", "one", viewerState?.reviewId],
    queryFn: () => reviewApi.get(viewerState.reviewId),
    enabled: Boolean(composing && viewerState?.reviewId),
  });

  const reviews = query.data?.pages.flatMap((page) => page.items) || [];
  const total = query.data?.pages[0]?.totalRecords ?? 0;

  return (
    <section aria-labelledby="reviews-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-title" className="display text-[clamp(2rem,2.6vw,2.5rem)] text-ink">Reviews</h2>
        {isMember && !composing && (
          <Button variant="secondary" onClick={() => setComposing(true)}>
            {viewerState?.reviewId ? "Edit your review" : "Write a review"}
          </Button>
        )}
      </div>
      <p className="mt-2 text-sm text-faint">{total ? `${plural(total, "review")} from Cinefile members` : "From Cinefile members"}</p>

      {composing && (
        <div className="mt-6">
          {viewerState?.reviewId && own.isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <Composer title={title} existing={own.data} currentRating={viewerState?.rating} onDone={() => setComposing(false)} />
          )}
        </div>
      )}

      <Tabs
        className="mt-6"
        ruled={false}
        label="Sort reviews"
        value={sort}
        onChange={setSort}
        tabs={[{ value: "popular", label: "Most helpful" }, { value: "recent", label: "Newest" }]}
      />

      {query.isLoading && <div className="space-y-6 py-6">{[0, 1].map((index) => <Skeleton key={index} className="h-32 w-full" />)}</div>}
      {query.isError && <ErrorState className="mt-6" message="Reviews didn't load." onRetry={() => query.refetch()} />}
      {query.isSuccess && !reviews.length && (
        <EmptyState className="mt-6" title="No reviews yet">
          {isMember ? "Be the first to say what you thought." : "Members who watch it will have their say here."}
        </EmptyState>
      )}

      <div>
        {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
      </div>

      {query.hasNextPage && (
        <Button variant="secondary" full onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} className="mt-4">
          {query.isFetchingNextPage ? "Loading..." : `More reviews (${reviews.length} of ${total})`}
        </Button>
      )}
    </section>
  );
}
