import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { plural, todayISO } from "../../Services/format";
import { titleHref } from "../../Services/images";
import { useToast } from "../../Context/ToastContext";
import { AccountShell } from "../Layout/AccountShell";
import { Poster } from "../Movie/PosterCard";
import { Tabs } from "../UI/Tabs";
import { Button, LinkButton } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { Field, TextArea, TextInput } from "../UI/Field";
import { RatingInput, RatingValue } from "../UI/RatingInput";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";

const monthName = (month) => new Intl.DateTimeFormat("en-GB", { month: "long" }).format(new Date(2000, month - 1, 1));
const weekday = (date) => new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(new Date(`${date}T00:00:00`));

function EditEntry({ entry, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [watchedOn, setWatchedOn] = useState(entry.watchedOn);
  const [rating, setRating] = useState(entry.rating);
  const [isRewatch, setIsRewatch] = useState(entry.isRewatch);
  const [note, setNote] = useState(entry.note || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const done = (message) => {
    toast.show(message);
    queryClient.invalidateQueries({ queryKey: ["me"] });
    onClose();
  };

  const save = useMutation({
    mutationFn: () => libraryApi.updateDiary(entry.id, { watchedOn, rating, isRewatch, note: note.trim() || null }),
    onSuccess: () => done("Diary entry updated"),
  });
  const remove = useMutation({
    mutationFn: () => libraryApi.deleteDiary(entry.id),
    onSuccess: () => done(`Removed ${entry.title.title} from your diary`),
  });

  return (
    <Dialog open onClose={onClose} title={entry.title.title}>
      <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="space-y-5">
        <Field label="Watched on">
          {(props) => <TextInput type="date" max={todayISO()} required value={watchedOn} onChange={(event) => setWatchedOn(event.target.value)} {...props} />}
        </Field>
        <RatingInput value={rating} onChange={(value) => setRating(value === rating ? null : value)} label="Rating for this viewing" />
        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" checked={isRewatch} onChange={(event) => setIsRewatch(event.target.checked)} className="h-4 w-4 accent-[#f5b02e]" />
          This was a rewatch
        </label>
        <Field label="Note" hint="Up to 500 characters.">
          {(props) => <TextArea maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} className="min-h-24" {...props} />}
        </Field>
        {(save.isError || remove.isError) && <p className="text-sm text-negative">{errorMessage(save.error || remove.error)}</p>}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {confirmDelete ? (
            <>
              <span className="text-sm text-muted">Delete this entry for good?</span>
              <Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>Delete Entry</Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Keep It</Button>
            </>
          ) : (
            <>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
              <Button variant="ghost" onClick={onClose} className="ml-auto">Cancel</Button>
              <Button type="submit" variant="primary" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
            </>
          )}
        </div>
      </form>
    </Dialog>
  );
}

function Diary() {
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState(null);
  const { data: years = [] } = useQuery({ queryKey: ["me", "diary", "years"], queryFn: libraryApi.diaryYears });
  const year = Number(params.get("year")) || years[0]?.year || new Date().getFullYear();

  const query = useInfiniteQuery({
    queryKey: ["me", "diary", year],
    queryFn: ({ pageParam }) => libraryApi.diary({ year, page: pageParam, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const entries = useMemo(() => query.data?.pages.flatMap((page) => page.items) || [], [query.data]);
  const total = query.data?.pages[0]?.totalRecords ?? 0;

  const months = useMemo(() => {
    const groups = new Map();
    entries.forEach((entry) => {
      const month = Number(entry.watchedOn.slice(5, 7));
      if (!groups.has(month)) groups.set(month, []);
      groups.get(month).push(entry);
    });
    return [...groups.entries()];
  }, [entries]);

  const rewatches = entries.filter((entry) => entry.isRewatch).length;
  const rated = entries.filter((entry) => entry.rating);
  const average = rated.length ? (rated.reduce((sum, entry) => sum + entry.rating, 0) / rated.length).toFixed(1) : null;

  return (
    <AccountShell
      title="Diary"
      subtitle={query.isSuccess ? `${plural(total, "entry", "entries")} in ${year}${rewatches ? `, ${rewatches} of them rewatches` : ""}${average && entries.length === total ? ` · average ${average} /10` : ""}` : " "}
      actions={<LinkButton to="/discover" variant="primary">Log a Film</LinkButton>}
    >
      {years.length > 0 && (
        <Tabs
          label="Year"
          value={year}
          onChange={(value) => setParams({ year: value })}
          tabs={years.map((item) => ({ value: item.year, label: String(item.year), count: item.entries }))}
        />
      )}

      <div className="mt-6">
        {query.isLoading && <div className="space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-[72px] w-full" />)}</div>}
        {query.isError && <ErrorState message="Your diary didn't load." onRetry={() => query.refetch()} />}
        {query.isSuccess && !entries.length && (
          <EmptyState title="Your diary is empty" action={<LinkButton to="/discover" variant="secondary">Find a Film to Log</LinkButton>}>
            Open any film or series and press Log to add the day you watched it.
          </EmptyState>
        )}

        <div className="space-y-10">
          {months.map(([month, items]) => (
            <section key={month} aria-labelledby={`month-${month}`}>
              <h2 id={`month-${month}`} className="flex items-baseline justify-between text-base font-semibold text-ink">
                {monthName(month)}
                <span className="num text-[13px] font-normal text-faint">{plural(items.length, "entry", "entries")}</span>
              </h2>
              <ul className="mt-2 divide-y divide-line">
                {items.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-4 py-3">
                    <span className="num w-12 flex-none text-center">
                      <span className="block text-xl leading-none text-ink">{Number(entry.watchedOn.slice(8, 10))}</span>
                      <span className="block text-[12px] text-faint">{weekday(entry.watchedOn)}</span>
                    </span>
                    <Link to={titleHref(entry.title)} className="w-10 flex-none overflow-hidden rounded-[4px]">
                      <Poster path={entry.title.posterPath} title={entry.title.title} sizes="40px" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={titleHref(entry.title)} className="block truncate text-[15px] text-ink can-hover:hover:text-accent">
                        {entry.title.title} <span className="text-faint">{entry.title.year}</span>
                      </Link>
                      <p className="truncate text-[13px] text-faint">
                        {[entry.title.mediaType === "tv" ? "Series" : "Film", entry.isRewatch && "Rewatch", entry.note].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <RatingValue value={entry.rating} className="w-14 flex-none text-right text-sm" />
                    <Button variant="ghost" size="sm" onClick={() => setEditing(entry)}>Edit</Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {query.hasNextPage && (
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>Older entries</Button>
          </div>
        )}
      </div>

      {editing && <EditEntry entry={editing} onClose={() => setEditing(null)} />}
    </AccountShell>
  );
}

export default Diary;
