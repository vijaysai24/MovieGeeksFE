import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BellRing, ListPlus, NotebookPen, Star } from "lucide-react";
import { useTitleActions, STATUS_LABELS, titleStateKey } from "../../Hooks/useTitleActions";
import { alertApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { formatDate } from "../../Services/format";
import { useToast } from "../../Context/ToastContext";
import { RatingInput } from "../UI/RatingInput";
import { Button } from "../UI/Button";
import { Skeleton } from "../UI/States";
import { LogDialog } from "./LogDialog";
import { AddToListDialog } from "./AddToListDialog";

// "Your take": everything a member records about one title, in the order people do it.
export function TitleActionPanel({ title }) {
  const actions = useTitleActions(title);
  const { state, isMember, loading } = actions;
  const queryClient = useQueryClient();
  const toast = useToast();
  const [dialog, setDialog] = useState(null);
  const statuses = title.mediaType === "tv" ? ["PLAN_TO_WATCH", "WATCHING", "WATCHED"] : ["PLAN_TO_WATCH", "WATCHED"];

  // Only offer the alert that can still happen in this country.
  const alertType = title.availability === "UPCOMING" ? "RELEASE"
    : ["IN_THEATRES", "RENT_OR_BUY", "NOT_AVAILABLE"].includes(title.availability) ? "STREAMING"
      : null;
  const alertOn = alertType && state.alerts?.includes(alertType);

  const alert = useMutation({
    mutationFn: () => (alertOn ? alertApi.clear(title.mediaType, title.id, alertType) : alertApi.set(title.mediaType, title.id, alertType)),
    onSuccess: (next) => {
      queryClient.setQueryData(titleStateKey(title.mediaType, title.id), next);
      toast.show(alertOn ? "Alert removed" : alertType === "RELEASE" ? "We'll tell you when it's out" : "We'll tell you when it starts streaming");
    },
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  const memberOnly = (fn) => () => (isMember ? fn() : actions.requireMember());

  if (loading) return <Skeleton className="h-[280px] w-full rounded-panel" />;

  return (
    <section aria-labelledby="your-take" className="rounded-panel bg-surface p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="your-take" className="text-h3 font-semibold text-ink">Your Take</h2>
        <button
          type="button"
          onClick={actions.toggleFavorite}
          aria-pressed={state.favorite}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-[background-color,transform] active:scale-95 ${
            state.favorite ? "bg-accent text-accent-ink" : "text-muted ring-1 ring-inset ring-control can-hover:hover:text-ink"
          }`}
        >
          <Star size={14} fill={state.favorite ? "currentColor" : "none"} aria-hidden="true" />
          {state.favorite ? "Favourite" : "Add to Favourites"}
        </button>
      </div>

      <div role="group" aria-label="Watch status" className="mt-5 grid auto-cols-fr grid-flow-col rounded-full bg-raised p-1">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={state.status === status}
            onClick={() => actions.setStatus(status)}
            className={`h-9 rounded-full px-2 text-[13px] transition-colors ${
              state.status === status ? "bg-ink font-medium text-ground" : "text-muted can-hover:hover:text-ink"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <RatingInput value={state.rating} onChange={actions.rate} disabled={actions.saving} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={memberOnly(() => setDialog("log"))}>
          <NotebookPen size={16} aria-hidden="true" /> Log Viewing
        </Button>
        <Button variant="secondary" onClick={memberOnly(() => setDialog("list"))}>
          <ListPlus size={16} aria-hidden="true" /> Add to List
        </Button>
        {alertType && (
          <Button variant={alertOn ? "primary" : "outline"} className="col-span-2" onClick={memberOnly(() => alert.mutate())} disabled={alert.isPending} aria-pressed={alertOn}>
            <BellRing size={16} aria-hidden="true" />
            {alertOn ? "Alert Set. Tap to Remove" : alertType === "RELEASE" ? "Tell Me When It's Out" : "Tell Me When It Streams"}
          </Button>
        )}
      </div>

      {isMember && (state.diaryCount > 0 || state.topFivePosition) && (
        <p className="mt-4 text-[13px] text-faint">
          {state.diaryCount > 0 && `In your diary ${state.diaryCount === 1 ? "once" : `${state.diaryCount} times`}, last on ${formatDate(state.lastWatchedOn)}.`}
          {state.topFivePosition && ` Number ${state.topFivePosition} in your five.`}
        </p>
      )}
      {!isMember && <p className="mt-4 text-[13px] text-faint">Sign in to rate, log and keep lists. Your wishlist works without an account.</p>}

      {dialog === "log" && (
        <LogDialog open onClose={() => setDialog(null)} title={title} currentRating={state.rating} previousViewings={state.diaryCount} />
      )}
      {dialog === "list" && <AddToListDialog title={title} onClose={() => setDialog(null)} />}
    </section>
  );
}
