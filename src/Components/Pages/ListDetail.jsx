import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Check, ListOrdered, Lock, Pencil, Plus, X } from "lucide-react";
import { collectionApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { backdropSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { plural, timeAgo } from "../../Services/format";
import { useToast } from "../../Context/ToastContext";
import { Poster, PosterCard } from "../Movie/PosterCard";
import { TitlePicker } from "../Movie/TitlePicker";
import { ListFormDialog } from "../Lists/ListFormDialog";
import { Avatar } from "../UI/Avatar";
import { Button, IconButton, LinkButton } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { TextInput } from "../UI/Field";
import { EmptyState, Skeleton, SkeletonText } from "../UI/States";

const refOf = (item) => `${item.mediaType}:${item.id}`;

function NoteEditor({ listId, item, onDone }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [note, setNote] = useState(item.note || "");
  const save = useMutation({
    mutationFn: () => collectionApi.updateItem(listId, item.mediaType, item.id, note.trim() || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      onDone();
    },
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  return (
    <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="mt-2 flex gap-2">
      <TextInput name="note" autoComplete="off" maxLength={500} aria-label={`Note on ${item.title}`} placeholder="Why it's here…" value={note} onChange={(event) => setNote(event.target.value)} autoFocus />
      <IconButton type="submit" label="Save note" variant="overlay" disabled={save.isPending}><Check size={16} aria-hidden="true" /></IconButton>
      <IconButton label="Cancel" onClick={onDone}><X size={16} aria-hidden="true" /></IconButton>
    </form>
  );
}

// A row in the numbered view, and in edit mode for either kind of list.
function ItemRow({ item, index, list, editing, canReorder, count, onMove, onRemove }) {
  const [noting, setNoting] = useState(false);

  return (
    <li className="grid grid-cols-[auto_4rem_minmax(0,1fr)] items-start gap-4 py-5 md:grid-cols-[auto_5rem_minmax(0,1fr)_auto] md:gap-6">
      <span className={`display num w-10 text-right text-[2.5rem] leading-none md:w-14 md:text-[3.25rem] ${list.isRanked ? "text-accent" : "text-control"}`}>
        {list.isRanked ? index + 1 : ""}
      </span>
      <Link to={titleHref(item)} className="block overflow-hidden rounded-poster" tabIndex={-1} aria-hidden="true">
        <Poster path={item.posterPath} title={item.title} sizes="80px" />
      </Link>
      <div className="min-w-0">
        <h3>
          <Link to={titleHref(item)} className="text-h3 font-semibold text-ink can-hover:hover:text-accent">{item.title}</Link>
          <span className="num ml-2 text-[15px] text-faint">{item.year || "TBA"}{item.mediaType === "tv" ? " · Series" : ""}</span>
        </h3>
        {item.rating > 0 && <p className="num mt-1 text-[13px] text-faint">TMDB {item.rating.toFixed(1)}</p>}
        {noting ? (
          <NoteEditor listId={list.id} item={item} onDone={() => setNoting(false)} />
        ) : (
          item.note && <p className="mt-3 max-w-[60ch] text-read text-muted">{item.note}</p>
        )}
        {editing && !noting && (
          <button type="button" onClick={() => setNoting(true)} className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-faint can-hover:hover:text-ink">
            <Pencil size={13} aria-hidden="true" /> {item.note ? "Edit Note" : "Add a Note"}
          </button>
        )}
      </div>
      {editing && (
        <div className="col-span-3 flex justify-end gap-1 md:col-span-1">
          {canReorder && (
            <>
              <IconButton label={`Move ${item.title} up`} disabled={index === 0} onClick={() => onMove(index, -1)}><ArrowUp size={16} aria-hidden="true" /></IconButton>
              <IconButton label={`Move ${item.title} down`} disabled={index === count - 1} onClick={() => onMove(index, 1)}><ArrowDown size={16} aria-hidden="true" /></IconButton>
            </>
          )}
          <IconButton label={`Remove ${item.title} from the list`} onClick={() => onRemove(item)}><X size={16} aria-hidden="true" /></IconButton>
        </div>
      )}
    </li>
  );
}

function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = useInfiniteQuery({
    queryKey: ["collections", "detail", Number(id)],
    queryFn: ({ pageParam }) => collectionApi.get(id, { page: pageParam, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.items.page < last.items.totalPages ? last.items.page + 1 : undefined),
  });
  const list = query.data?.pages[0];
  const items = query.data?.pages.flatMap((page) => page.items.items) || [];

  useEffect(() => {
    if (list) document.title = `${list.name} · a list by ${list.author.name} · Cinefile`;
    return () => {
      document.title = "Cinefile";
    };
  }, [list]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["collections"] });
  const onError = (err) => toast.show(errorMessage(err), { tone: "error" });

  const add = useMutation({
    mutationFn: (title) => collectionApi.addItem(list.id, { mediaType: title.mediaType, tmdbId: title.id }).then(() => title),
    onSuccess: (title) => {
      toast.show(`Added ${title.title}`);
      refresh();
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (item) => collectionApi.removeItem(list.id, item.mediaType, item.id).then(() => item),
    onSuccess: (item) => {
      toast.show(`Removed ${item.title}`);
      refresh();
    },
    onError,
  });

  const reorder = useMutation({
    mutationFn: (ordered) => collectionApi.reorder(list.id, ordered.map((item) => ({ mediaType: item.mediaType, tmdbId: item.id }))),
    onSuccess: refresh,
    onError,
  });

  const destroy = useMutation({
    mutationFn: () => collectionApi.remove(list.id),
    onSuccess: () => {
      toast.show(`Deleted ${list.name}`);
      refresh();
      navigate(`/u/${list.author.username}?tab=lists`, { replace: true });
    },
    onError,
  });

  const move = (index, delta) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    // Show the new order straight away; the server confirms it.
    // Every page is loaded by now, so the merged order becomes one complete page.
    queryClient.setQueryData(["collections", "detail", Number(id)], (current) => ({
      pages: [{ ...current.pages[0], items: { ...current.pages[0].items, items: next, page: current.pages[0].items.totalPages } }],
      pageParams: [current.pageParams[0]],
    }));
    reorder.mutate(next);
  };

  if (query.isLoading) {
    return (
      <div aria-busy="true">
        <Skeleton className="h-[38svh] min-h-[280px] w-full rounded-none" />
        <div className="page -mt-16"><Skeleton className="h-14 w-2/3" /><SkeletonText className="mt-6 max-w-lg" lines={2} /></div>
      </div>
    );
  }

  if (query.isError) {
    const missing = [403, 404].includes(query.error?.response?.status);
    return (
      <div className="page pb-10 pt-32">
        <h1 className="display text-h1">{missing ? "This list isn't here" : "This list didn't load"}</h1>
        <p className="mt-4 max-w-md text-read text-muted">{missing ? "It may be private, or it has been deleted." : "Try again in a moment."}</p>
        <div className="mt-8 flex gap-3">
          {!missing && <Button variant="primary" onClick={() => query.refetch()}>Try Again</Button>}
          <LinkButton to="/community?tab=lists" variant="secondary">Browse Lists</LinkButton>
        </div>
      </div>
    );
  }

  const backdrop = items.find((item) => item.backdropPath)?.backdropPath;
  const fullyLoaded = !query.hasNextPage;
  const chosen = new Set(items.map(refOf));
  const rows = list.isRanked || editing;

  return (
    <>
      <section aria-labelledby="list-name">
        <div className={`relative overflow-hidden ${backdrop ? "h-[38svh] min-h-[280px] bg-surface" : "h-[200px] bg-linear-to-b from-surface to-ground"}`}>
          {backdrop && (
            <>
              <img src={tmdbImage(backdrop, "w1280")} srcSet={backdropSrcSet(backdrop)} sizes="100vw" alt="" width="1920" height="1080" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover" />
              <div className="scrim-bottom absolute inset-0" aria-hidden="true" />
            </>
          )}
        </div>
        <div className="page relative -mt-24 md:-mt-28">
          <Link to={`/u/${list.author.username}?tab=lists`} className="inline-flex items-center gap-2.5 text-ui text-muted can-hover:hover:text-ink">
            <Avatar user={list.author} size="sm" />
            A list by <span className="font-medium text-ink">{list.author.name}</span>
          </Link>
          <h1 id="list-name" className="display mt-4 max-w-[20ch] text-h1 leading-[1] text-ink">{list.name}</h1>
          {list.description && <p className="mt-5 max-w-[60ch] text-lead text-muted">{list.description}</p>}
          <p className="num mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-faint">
            <span>{plural(list.itemCount, "title")}</span>
            {list.isRanked && <span className="inline-flex items-center gap-1.5"><ListOrdered size={14} aria-hidden="true" /> Ranked</span>}
            {!list.isPublic && <span className="inline-flex items-center gap-1.5"><Lock size={13} aria-hidden="true" /> Private</span>}
            <span>Updated {timeAgo(list.updatedAt)}</span>
          </p>

          {list.isOwn && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant="accent" onClick={() => setDialog("add")}><Plus size={16} aria-hidden="true" /> Add Titles</Button>
              {items.length > 0 && (
                <Button variant={editing ? "primary" : "secondary"} onClick={() => setEditing((value) => !value)} aria-pressed={editing}>
                  {editing ? "Done Editing" : "Edit Titles"}
                </Button>
              )}
              <Button variant="ghost" onClick={() => setDialog("edit")}>Edit Details</Button>
              {confirmDelete ? (
                <span className="flex items-center gap-2">
                  <Button variant="danger" onClick={() => destroy.mutate()} disabled={destroy.isPending}>Delete for Good</Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Keep It</Button>
                </span>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmDelete(true)}>Delete List</Button>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="page mt-14 md:mt-20">
        {!items.length ? (
          <EmptyState title="Nothing on this list yet" action={list.isOwn && <Button variant="primary" onClick={() => setDialog("add")}>Add the First Title</Button>}>
            {list.isOwn ? "Search for films and series to add. You can number them and leave a note on each." : "Check back later."}
          </EmptyState>
        ) : rows ? (
          <>
            {editing && list.isRanked && !fullyLoaded && (
              <p className="mb-4 text-[14px] text-faint">Load the whole list to change its order.</p>
            )}
            <ol className="max-w-4xl divide-y divide-line">
              {items.map((item, index) => (
                <ItemRow
                  key={refOf(item)}
                  item={item}
                  index={index}
                  list={list}
                  editing={editing}
                  canReorder={list.isRanked && fullyLoaded && !reorder.isPending}
                  count={items.length}
                  onMove={move}
                  onRemove={(target) => remove.mutate(target)}
                />
              ))}
            </ol>
          </>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item, index) => (
              <li key={refOf(item)}>
                <PosterCard item={item} eager={index < 6} sizes="(min-width: 1280px) 15vw, (min-width: 768px) 22vw, 45vw" />
                {item.note && <p className="mt-2 line-clamp-3 text-[14px] text-muted">“{item.note}”</p>}
              </li>
            ))}
          </ul>
        )}

        {query.hasNextPage && (
          <div className="mt-10 flex justify-center">
            <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
              {query.isFetchingNextPage ? "Loading…" : `Show More (${items.length} of ${list.itemCount})`}
            </Button>
          </div>
        )}
      </div>

      {dialog === "edit" && <ListFormDialog list={list} onClose={() => setDialog(null)} />}
      {dialog === "add" && (
        <Dialog open onClose={() => setDialog(null)} title={`Add to ${list.name}`}>
          <TitlePicker onPick={(title) => add.mutate(title)} chosen={chosen} disabled={add.isPending} autoFocus />
          <p className="mt-4 text-[13px] text-faint">Titles go to the end of the list. {list.isRanked ? "Reorder them with Edit Titles." : ""}</p>
        </Dialog>
      )}
    </>
  );
}

export default ListDetail;
