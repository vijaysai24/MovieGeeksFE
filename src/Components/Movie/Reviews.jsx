import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeOff, Flag, MessageCircle, MessageSquareText, Star, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
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
import { SectionHead } from "../UI/Section";
import { Segmented } from "../UI/Tabs";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";
import { Poster } from "./PosterCard";

const REPORT_REASONS = [
  ["SPOILERS", "Unmarked spoilers"],
  ["SPAM", "Spam or advertising"],
  ["HARASSMENT", "Harassment or bullying"],
  ["HATE", "Hate speech"],
  ["OTHER", "Something else"],
];

// Reviews longer than this open folded, so one essay doesn't push the rest off the page.
const FOLD_AT = 640;

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
        <fieldset className="space-y-1">
          <legend className="mb-2 text-[15px] text-muted">What's wrong with it?</legend>
          {REPORT_REASONS.map(([value, label]) => (
            <label key={value} className="flex min-h-10 items-center gap-3 text-[15px] text-ink">
              <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} className="h-4 w-4 accent-[#f5b02e]" />
              {label}
            </label>
          ))}
        </fieldset>
        <TextArea name="details" aria-label="Details (optional)" placeholder="Anything a moderator should know (optional)" maxLength={500} value={details} onChange={(event) => setDetails(event.target.value)} className="min-h-20" />
        {mutation.isError && <p className="text-sm text-negative">{errorMessage(mutation.error)}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>Send Report</Button>
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
  const [confirming, setConfirming] = useState(null);
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
      setConfirming(null);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  return (
    <div className="mt-5 border-t border-line pt-5">
      {isLoading && <Skeleton className="h-10 w-full" />}
      {isError && <ErrorState message="Comments didn't load." onRetry={refetch} />}
      {data && !data.items.length && <p className="text-sm text-faint">No comments yet.</p>}
      <ul className="space-y-5">
        {data?.items.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <Avatar user={comment.author} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-faint">
                <Link to={`/u/${comment.author.username}`} className="font-medium text-ink can-hover:hover:text-accent">{comment.author.name}</Link>
                {" · "}{timeAgo(comment.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-line break-words text-[15px] leading-relaxed text-ink">{comment.body}</p>
            </div>
            {isMember && (
              comment.isOwn || review.isOwn ? (
                confirming === comment.id ? (
                  <span className="flex flex-none items-start gap-1">
                    <button type="button" onClick={() => remove.mutate(comment.id)} disabled={remove.isPending} className="h-8 rounded-full px-3 text-[13px] font-medium text-negative can-hover:hover:bg-white/[0.06]">Delete</button>
                    <button type="button" onClick={() => setConfirming(null)} className="h-8 rounded-full px-3 text-[13px] text-muted can-hover:hover:text-ink">Keep</button>
                  </span>
                ) : (
                  <button type="button" aria-label="Delete comment" onClick={() => setConfirming(comment.id)} className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-faint can-hover:hover:bg-white/[0.06] can-hover:hover:text-ink">
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                )
              ) : (
                <button type="button" aria-label="Report comment" onClick={() => setReporting({ targetType: "COMMENT", targetId: comment.id })} className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-faint can-hover:hover:bg-white/[0.06] can-hover:hover:text-ink">
                  <Flag size={14} aria-hidden="true" />
                </button>
              )
            )}
          </li>
        ))}
      </ul>
      {isMember ? (
        <form onSubmit={(event) => { event.preventDefault(); if (body.trim()) post.mutate(); }} className="mt-5 flex items-end gap-2">
          <TextArea name="comment" aria-label="Write a comment" placeholder="Add to the conversation…" maxLength={1000} value={body} onChange={(event) => setBody(event.target.value)} className="min-h-11 flex-1 resize-none py-2.5" rows={1} />
          <Button type="submit" variant="primary" disabled={!body.trim() || post.isPending}>Post</Button>
        </form>
      ) : (
        <p className="mt-5 text-sm text-faint"><Link to="/login" className="text-ink can-hover:hover:text-accent">Sign in</Link> to join the conversation.</p>
      )}
      {post.isError && <p className="mt-2 text-sm text-negative">{errorMessage(post.error)}</p>}
      {reporting && <ReportDialog target={reporting} onClose={() => setReporting(null)} />}
    </div>
  );
}

function ReactionButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`num inline-flex h-9 items-center gap-1.5 rounded-full px-3 transition-[background-color,color,transform] active:scale-95 disabled:cursor-default disabled:active:scale-100 ${
        active ? "bg-ink text-ground" : "text-muted can-hover:hover:bg-white/[0.06] can-hover:hover:text-ink"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ReviewCard({ review, showTitle = false, onChanged }) {
  const { isMember } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [revealed, setRevealed] = useState(!review.hasSpoilers);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [local, setLocal] = useState(null);
  const current = local || review;
  const folded = current.body.length > FOLD_AT && !expanded;
  const titleHref = current.title && `/${current.title.mediaType}/${current.title.id}`;

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
    <article className="rounded-panel bg-surface p-5 md:p-6">
      <div className="flex gap-5">
        {showTitle && current.title && (
          <Link to={titleHref} className="w-16 flex-none self-start overflow-hidden rounded-poster md:w-20" tabIndex={-1} aria-hidden="true">
            <Poster path={current.title.posterPath} title={current.title.title} sizes="80px" />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          {showTitle && current.title && (
            <h3 className="mb-3">
              <Link to={titleHref} className="display text-[1.375rem] leading-tight text-ink can-hover:hover:text-accent">{current.title.title}</Link>
              {current.title.year && <span className="num ml-2 text-[15px] text-faint">{current.title.year}</span>}
            </h3>
          )}

          <header className="flex items-center gap-3">
            <Link to={`/u/${current.author.username}`} className="group flex min-w-0 items-center gap-3">
              <Avatar user={current.author} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium text-ink can-hover:group-hover:text-accent">{current.author.name}</span>
                <span className="block truncate text-[13px] text-faint">
                  @{current.author.username} · {timeAgo(current.createdAt)}{current.edited && " · edited"}
                </span>
              </span>
            </Link>
            {current.authorRating && (
              <span className="num ml-auto inline-flex h-8 flex-none items-center gap-1.5 rounded-full bg-raised px-3 text-[14px]">
                <Star size={13} className="text-accent" fill="currentColor" aria-hidden="true" />
                <span className="font-semibold text-ink">{current.authorRating}</span>
                <span className="text-faint">/10</span>
              </span>
            )}
          </header>

          {current.status === "HIDDEN" && (
            <p className="mt-4 rounded-control bg-[#2a2310] px-3.5 py-2.5 text-[13px] text-[#f0cf86]">
              Hidden while moderators review reports. Only you can see it.
            </p>
          )}

          {revealed ? (
            <>
              <p className={`mt-4 whitespace-pre-line break-words text-[16px] leading-[1.65] text-ink ${folded ? "line-clamp-[8]" : ""}`}>{current.body}</p>
              {current.body.length > FOLD_AT && (
                <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="mt-2 text-[15px] font-medium text-accent can-hover:hover:text-accent-hover">
                  {expanded ? "Show Less" : "Read More"}
                </button>
              )}
            </>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-control bg-raised px-4 py-3.5">
              <EyeOff size={18} className="flex-none text-accent" aria-hidden="true" />
              <p className="min-w-[12rem] flex-1 text-[15px] text-muted">
                <span className="font-medium text-ink">Spoiler warning.</span> This review talks about the plot.
              </p>
              <Button size="sm" variant="outline" onClick={() => setRevealed(true)}>Show Review</Button>
            </div>
          )}

          <footer className="-ml-3 mt-4 flex flex-wrap items-center gap-1 text-[13px]">
            <ReactionButton active={current.viewerReaction === "LIKE"} onClick={() => onReact("LIKE")} disabled={current.isOwn}>
              <ThumbsUp size={15} aria-hidden="true" />
              <span>{current.likeCount}</span>
              <span className="sr-only">found this helpful</span>
            </ReactionButton>
            <ReactionButton active={current.viewerReaction === "DISLIKE"} onClick={() => onReact("DISLIKE")} disabled={current.isOwn} aria-label="Not helpful">
              <ThumbsDown size={15} aria-hidden="true" />
              {current.dislikeCount > 0 && <span>{current.dislikeCount}</span>}
            </ReactionButton>
            <ReactionButton active={false} onClick={() => setShowComments((value) => !value)} aria-pressed={undefined} aria-expanded={showComments}>
              <MessageCircle size={15} aria-hidden="true" />
              {current.commentCount ? plural(current.commentCount, "comment") : "Comment"}
            </ReactionButton>
            {isMember && !current.isOwn && (
              <button type="button" onClick={() => setReporting(true)} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-faint can-hover:hover:text-ink">
                <Flag size={13} aria-hidden="true" /> Report
              </button>
            )}
          </footer>
        </div>
      </div>

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
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="rounded-panel bg-surface p-5 md:p-6">
      <label htmlFor="review-body" className="text-h3 font-semibold text-ink">
        {existing ? "Edit your review" : `Your review of ${title.title}`}
      </label>
      <TextArea
        id="review-body"
        name="review"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        minLength={3}
        maxLength={8000}
        required
        placeholder="What worked, what didn't, what stayed with you…"
        className="mt-4 min-h-40"
        aria-describedby="review-hint"
      />
      <p id="review-hint" className="num mt-2 text-[13px] text-faint">
        {currentRating ? `Shown with your rating of ${currentRating}/10. ` : "Rate it in Your Take and your score shows with the review. "}
        {body.length}/8000
      </p>
      <label className="mt-4 flex min-h-10 items-center gap-3 text-[15px] text-ink">
        <input type="checkbox" checked={hasSpoilers} onChange={(event) => setHasSpoilers(event.target.checked)} className="h-4 w-4 accent-[#f5b02e]" />
        This review contains spoilers
      </label>
      {(save.isError || remove.isError) && <p className="mt-3 text-sm text-negative" role="alert">{errorMessage(save.error || remove.error)}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={save.isPending || body.trim().length < 3}>
          {save.isPending ? "Saving…" : existing ? "Save Changes" : "Post Review"}
        </Button>
        {existing && (confirmDelete ? (
          <>
            <Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>Delete for Good</Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Keep It</Button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>Delete Review</Button>
        ))}
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
      <SectionHead id="reviews-title" title="Reviews" subtitle={total ? `${plural(total, "review")} from Cinefile members` : "From Cinefile members"}>
        {isMember && !composing && (
          <Button variant="secondary" onClick={() => setComposing(true)}>
            {viewerState?.reviewId ? "Edit Your Review" : "Write a Review"}
          </Button>
        )}
      </SectionHead>

      {composing && (
        <div className="mb-6">
          {viewerState?.reviewId && own.isLoading ? (
            <Skeleton className="h-56 w-full rounded-panel" />
          ) : (
            <Composer title={title} existing={own.data} currentRating={viewerState?.rating} onDone={() => setComposing(false)} />
          )}
        </div>
      )}

      {total > 1 && (
        <Segmented
          size="sm"
          label="Sort reviews"
          value={sort}
          onChange={setSort}
          options={[{ value: "popular", label: "Most Helpful" }, { value: "recent", label: "Newest" }]}
        />
      )}

      {query.isLoading && <div className="mt-5 space-y-3">{[0, 1].map((index) => <Skeleton key={index} className="h-36 w-full rounded-panel" />)}</div>}
      {query.isError && <ErrorState className="mt-5" message="Reviews didn't load." onRetry={() => query.refetch()} />}
      {query.isSuccess && !reviews.length && (
        <EmptyState icon={MessageSquareText} title="No reviews yet" action={isMember && !composing && <Button variant="primary" onClick={() => setComposing(true)}>Write the First One</Button>}>
          {isMember ? "Be the first to say what you thought." : "Members who watch it will have their say here."}
        </EmptyState>
      )}

      {reviews.length > 0 && (
        <div className={`space-y-3 ${total > 1 ? "mt-5" : ""}`}>
          {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      )}

      {query.hasNextPage && (
        <Button variant="secondary" full onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} className="mt-4">
          {query.isFetchingNextPage ? "Loading…" : `More Reviews (${reviews.length} of ${total})`}
        </Button>
      )}
    </section>
  );
}
