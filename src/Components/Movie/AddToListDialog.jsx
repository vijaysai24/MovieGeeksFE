import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Lock, Plus } from "lucide-react";
import { collectionApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { useToast } from "../../Context/ToastContext";
import { Dialog } from "../UI/Dialog";
import { Button } from "../UI/Button";
import { TextInput } from "../UI/Field";
import { Skeleton } from "../UI/States";

// Put one title on any of your lists, or start a new list with it.
export function AddToListDialog({ title, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const key = ["me", "collections", "containing", title.mediaType, title.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => collectionApi.mine({ containing: `${title.mediaType}:${title.id}`, limit: 50 }),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["me", "collections"] });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  const toggle = useMutation({
    mutationFn: (list) => (list.containsTitle
      ? collectionApi.removeItem(list.id, title.mediaType, title.id)
      : collectionApi.addItem(list.id, { mediaType: title.mediaType, tmdbId: title.id })),
    onSuccess: (result, list) => {
      toast.show(list.containsTitle ? `Removed from ${list.name}` : `Added to ${list.name}`);
      refresh();
    },
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  const create = useMutation({
    mutationFn: async () => {
      const list = await collectionApi.create({ name: name.trim(), isPublic });
      await collectionApi.addItem(list.id, { mediaType: title.mediaType, tmdbId: title.id });
      return list;
    },
    onSuccess: (list) => {
      toast.show(`Started ${list.name} with ${title.title}`);
      setName("");
      refresh();
    },
  });

  const lists = data?.items || [];

  return (
    <Dialog open onClose={onClose} title={`Add ${title.title} to a List`}>
      <div className="-mx-2 max-h-[42vh] overflow-y-auto overscroll-contain">
        {isLoading && <Skeleton className="mx-2 h-24" />}
        {!isLoading && !lists.length && <p className="px-2 text-[15px] text-muted">You have no lists yet. Start one below.</p>}
        <ul>
          {lists.map((list) => (
            <li key={list.id}>
              <button
                type="button"
                aria-pressed={list.containsTitle}
                onClick={() => toggle.mutate(list)}
                disabled={toggle.isPending}
                className="flex w-full items-center gap-3 rounded-control px-2 py-2.5 text-left transition-colors can-hover:hover:bg-raised"
              >
                <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full ${list.containsTitle ? "bg-accent text-accent-ink" : "ring-1 ring-inset ring-control"}`}>
                  {list.containsTitle && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-ink">{list.name}</span>
                  <span className="num block text-[13px] text-faint">{list.itemCount} {list.itemCount === 1 ? "title" : "titles"}</span>
                </span>
                {!list.isPublic && <Lock size={14} className="text-faint" aria-label="Private" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) create.mutate();
        }}
        className="mt-7"
      >
        <label htmlFor="new-list" className="text-sm font-medium text-ink">Start a new list</label>
        <div className="mt-2 flex gap-2">
          <TextInput id="new-list" name="list-name" autoComplete="off" maxLength={100} placeholder="Best rainy-night thrillers…" value={name} onChange={(event) => setName(event.target.value)} />
          <Button type="submit" variant="primary" disabled={!name.trim() || create.isPending}>
            <Plus size={16} aria-hidden="true" /> Create
          </Button>
        </div>
        <label className="mt-3 flex items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" checked={!isPublic} onChange={(event) => setIsPublic(!event.target.checked)} className="h-4 w-4 accent-[#f5b02e]" />
          Keep it private
        </label>
        {create.isError && <p className="mt-2 text-sm text-negative">{errorMessage(create.error)}</p>}
      </form>
    </Dialog>
  );
}
