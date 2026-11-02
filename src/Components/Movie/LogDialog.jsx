import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { todayISO } from "../../Services/format";
import { useToast } from "../../Context/ToastContext";
import { titleStateKey } from "../../Hooks/useTitleActions";
import { Dialog } from "../UI/Dialog";
import { Button } from "../UI/Button";
import { Field, TextArea, TextInput } from "../UI/Field";
import { RatingInput } from "../UI/RatingInput";

// Adds one viewing to the diary. A title already in the diary defaults to "rewatch".
export function LogDialog({ open, onClose, title, currentRating, previousViewings = 0 }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [watchedOn, setWatchedOn] = useState(todayISO());
  const [rating, setRating] = useState(currentRating || null);
  const [isRewatch, setIsRewatch] = useState(previousViewings > 0);
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () => libraryApi.logWatch({
      mediaType: title.mediaType,
      tmdbId: title.id,
      watchedOn,
      rating,
      isRewatch,
      note: note.trim() || null,
    }),
    onSuccess: () => {
      toast.show(`${title.title} is in your diary`);
      queryClient.invalidateQueries({ queryKey: titleStateKey(title.mediaType, title.id) });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["community", title.mediaType, title.id] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} title={`Log ${title.title}`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
        className="space-y-5"
      >
        <Field label="Watched on">
          {(props) => <TextInput type="date" max={todayISO()} required value={watchedOn} onChange={(event) => setWatchedOn(event.target.value)} {...props} />}
        </Field>

        <RatingInput value={rating} onChange={(value) => setRating(value === rating ? null : value)} />

        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" checked={isRewatch} onChange={(event) => setIsRewatch(event.target.checked)} className="h-4 w-4 accent-[#f5b02e]" />
          I've seen this before
        </label>

        <Field label="Note" hint="Optional, up to 500 characters. Only the date and rating appear in your friends' feeds.">
          {(props) => <TextArea maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Where, who with, what stayed with you" className="min-h-24" {...props} />}
        </Field>

        {mutation.isError && <p className="text-sm text-negative" role="alert">{errorMessage(mutation.error)}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save to Diary"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
