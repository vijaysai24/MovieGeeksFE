import { useState } from "react";
import { Heart, NotebookPen, Star } from "lucide-react";
import { useTitleActions, STATUS_LABELS } from "../../Hooks/useTitleActions";
import { RatingInput } from "../UI/RatingInput";
import { Button } from "../UI/Button";
import { Skeleton } from "../UI/States";
import { LogDialog } from "./LogDialog";
import { formatDate } from "../../Services/format";

// Everything a member can do with one title, in the order people do it.
export function TitleActionPanel({ title }) {
  const actions = useTitleActions(title);
  const { state, isMember, loading } = actions;
  const [logging, setLogging] = useState(false);
  const statuses = title.mediaType === "tv" ? ["PLAN_TO_WATCH", "WATCHING", "WATCHED"] : ["PLAN_TO_WATCH", "WATCHED"];

  if (loading) return <Skeleton className="h-[148px] w-full rounded-lg" />;

  return (
    <div data-ui className="rounded-lg bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={actions.toggleWishlist}
          aria-pressed={state.wishlisted}
          className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-[background-color,transform] active:scale-[0.96] ${
            state.wishlisted ? "bg-ink text-ground" : "text-ink ring-1 ring-inset ring-control hover:bg-white/[0.06]"
          }`}
        >
          <Heart size={16} fill={state.wishlisted ? "currentColor" : "none"} aria-hidden="true" />
          {state.wishlisted ? "On your wishlist" : "Wishlist"}
        </button>

        <div role="group" aria-label="Watch status" className="inline-flex rounded-full bg-raised p-1">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={state.status === status}
              onClick={() => actions.setStatus(status)}
              className={`h-[30px] rounded-full px-3 text-[13px] transition-colors ${
                state.status === status ? "bg-ink font-medium text-ground" : "text-muted hover:text-ink"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={actions.toggleFavorite}
          aria-pressed={state.favorite}
          aria-label={state.favorite ? "Remove from favourites" : "Add to favourites"}
          title={state.favorite ? "One of your favourites" : "Add to favourites"}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-[background-color,transform] active:scale-90 ${
            state.favorite ? "bg-accent text-accent-ink" : "text-muted ring-1 ring-inset ring-control hover:text-ink"
          }`}
        >
          <Star size={16} fill={state.favorite ? "currentColor" : "none"} aria-hidden="true" />
        </button>

        <Button variant="secondary" onClick={() => (isMember ? setLogging(true) : actions.requireMember())} className="ml-auto">
          <NotebookPen size={16} aria-hidden="true" />
          Log
        </Button>
      </div>

      <div className="mt-5">
        <RatingInput value={state.rating} onChange={actions.rate} disabled={actions.saving} />
      </div>

      {isMember && (state.diaryCount > 0 || state.topFivePosition) && (
        <p className="mt-4 text-[13px] text-faint">
          {state.diaryCount > 0 && `In your diary ${state.diaryCount === 1 ? "once" : `${state.diaryCount} times`}, last on ${formatDate(state.lastWatchedOn)}.`}
          {state.topFivePosition && ` Number ${state.topFivePosition} in your five.`}
        </p>
      )}

      {logging && (
        <LogDialog
          open
          onClose={() => setLogging(false)}
          title={title}
          currentRating={state.rating}
          previousViewings={state.diaryCount}
        />
      )}
    </div>
  );
}
