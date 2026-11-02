import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { libraryApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { tmdbImage } from "../../Services/images";
import { useToast } from "../../Context/ToastContext";
import { Dialog } from "../UI/Dialog";
import { Button, IconButton } from "../UI/Button";
import { TitlePicker } from "./TitlePicker";

// Choose and order the five titles that open your profile.
export function TopFiveEditor({ initial = [], onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [picks, setPicks] = useState(initial.map(({ position: _position, ...title }) => title));

  const save = useMutation({
    mutationFn: () => libraryApi.setTopFive(picks.map((title) => ({ mediaType: title.mediaType, tmdbId: title.id }))),
    onSuccess: () => {
      toast.show("Your five are saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      onClose();
    },
  });

  const add = (title) => {
    if (picks.length >= 5 || picks.some((pick) => pick.mediaType === title.mediaType && pick.id === title.id)) return;
    setPicks([...picks, title]);
  };

  const move = (index, delta) => {
    const next = [...picks];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setPicks(next);
  };

  return (
    <Dialog open onClose={onClose} title="Your five">
      <p className="-mt-2 text-[15px] text-muted">The five films or series that say the most about you, in order.</p>

      <ol className="mt-5 space-y-2">
        {picks.map((title, index) => (
          <li key={`${title.mediaType}:${title.id}`} className="flex items-center gap-3 rounded-control bg-raised p-2">
            <span className="display num w-7 flex-none text-center text-[1.75rem] leading-none text-accent">{index + 1}</span>
            <img src={tmdbImage(title.posterPath, "w92")} alt="" width="32" height="48" className="h-12 w-8 flex-none rounded-[3px] bg-nested object-cover" />
            <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{title.title} <span className="num text-faint">{title.year}</span></span>
            <IconButton size="sm" label={`Move ${title.title} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} aria-hidden="true" /></IconButton>
            <IconButton size="sm" label={`Move ${title.title} down`} disabled={index === picks.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} aria-hidden="true" /></IconButton>
            <IconButton size="sm" label={`Remove ${title.title}`} onClick={() => setPicks(picks.filter((_, at) => at !== index))}><X size={16} aria-hidden="true" /></IconButton>
          </li>
        ))}
        {Array.from({ length: 5 - picks.length }, (_, index) => (
          <li key={`empty-${index}`} className="flex h-16 items-center gap-3 rounded-control border border-dashed border-control px-2 text-[15px] text-faint">
            <span className="display num w-7 text-center text-[1.75rem] leading-none text-control" aria-hidden="true">{picks.length + index + 1}</span>
            Space for one more
          </li>
        ))}
      </ol>

      {picks.length < 5 && (
        <div className="mt-5">
          <TitlePicker onPick={add} chosen={new Set(picks.map((pick) => `${pick.mediaType}:${pick.id}`))} />
        </div>
      )}

      {save.isError && <p className="mt-4 text-sm text-negative">{errorMessage(save.error)}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save Your Five"}</Button>
      </div>
    </Dialog>
  );
}
