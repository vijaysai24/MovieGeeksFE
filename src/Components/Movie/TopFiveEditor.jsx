import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { libraryApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { tmdbImage } from "../../Services/images";
import { useDebouncedValue } from "../../Hooks/useDebouncedValue";
import { useToast } from "../../Context/ToastContext";
import { Dialog } from "../UI/Dialog";
import { Button } from "../UI/Button";
import { TextInput } from "../UI/Field";

// Choose and order the five titles that open your profile.
export function TopFiveEditor({ initial = [], onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [picks, setPicks] = useState(initial.map(({ position: _position, ...title }) => title));
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 250);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["catalog", "autocomplete", debounced.toLowerCase()],
    queryFn: () => catalogApi.autocomplete(debounced),
    enabled: debounced.length >= 2,
  });

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
    setQuery("");
  };

  const move = (index, delta) => {
    const next = [...picks];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setPicks(next);
  };

  const options = suggestions.filter((item) => item.mediaType !== "person");

  return (
    <Dialog open onClose={onClose} title="Your five">
      <p className="-mt-2 text-sm text-muted">The five films or series that say the most about you, in order.</p>

      <ol className="mt-5 space-y-2">
        {picks.map((title, index) => (
          <li key={`${title.mediaType}:${title.id}`} className="flex items-center gap-3 rounded-lg bg-raised p-2">
            <img src={tmdbImage(title.posterPath, "w92")} alt="" width="32" height="48" className="h-12 w-8 flex-none rounded-[3px] bg-nested object-cover" />
            <span className="min-w-0 flex-1 truncate text-sm text-ink">{title.title} <span className="text-faint">{title.year}</span></span>
            <button type="button" aria-label={`Move ${title.title} up`} disabled={index === 0} onClick={() => move(index, -1)} className="rounded-full p-1.5 text-muted hover:text-ink disabled:opacity-30"><ArrowUp size={16} /></button>
            <button type="button" aria-label={`Move ${title.title} down`} disabled={index === picks.length - 1} onClick={() => move(index, 1)} className="rounded-full p-1.5 text-muted hover:text-ink disabled:opacity-30"><ArrowDown size={16} /></button>
            <button type="button" aria-label={`Remove ${title.title}`} onClick={() => setPicks(picks.filter((_, at) => at !== index))} className="rounded-full p-1.5 text-muted hover:text-ink"><X size={16} /></button>
          </li>
        ))}
        {Array.from({ length: 5 - picks.length }, (_, index) => (
          <li key={`empty-${index}`} className="flex h-16 items-center rounded-lg border border-dashed border-control px-4 text-sm text-faint">
            Space for one more
          </li>
        ))}
      </ol>

      {picks.length < 5 && (
        <div className="mt-5">
          <TextInput aria-label="Find a film or series to add" placeholder="Find a film or series" value={query} onChange={(event) => setQuery(event.target.value)} />
          {options.length > 0 && (
            <ul className="mt-2 max-h-56 overflow-y-auto rounded-lg bg-raised py-1">
              {options.map((item) => (
                <li key={`${item.mediaType}:${item.id}`}>
                  <button type="button" onClick={() => add(item)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-nested">
                    <img src={tmdbImage(item.posterPath, "w92")} alt="" width="24" height="36" className="h-9 w-6 flex-none rounded-[2px] bg-nested object-cover" />
                    <span className="truncate text-sm text-ink">{item.title} <span className="text-faint">{item.year} · {item.mediaType === "tv" ? "Series" : "Film"}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {save.isError && <p className="mt-4 text-sm text-negative">{errorMessage(save.error)}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving..." : "Save your five"}</Button>
      </div>
    </Dialog>
  );
}
