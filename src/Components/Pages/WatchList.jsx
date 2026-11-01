import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { libraryApi } from "../../Services/userService";
import { formatNumber, plural } from "../../Services/format";
import { useAuth } from "../../Context/AuthContext";
import { useGuestWishlist } from "../../Services/guestWishlist";
import { AccountShell } from "../Layout/AccountShell";
import { PosterGrid } from "../Movie/PosterGrid";
import { Tabs, Segmented } from "../UI/Tabs";
import { Select } from "../UI/Field";
import { Button, LinkButton } from "../UI/Button";
import { EmptyState, ErrorState } from "../UI/States";

const TABS = [
  { value: "wishlist", label: "Wishlist", count: "wishlist" },
  { value: "PLAN_TO_WATCH", label: "Plan to watch", count: "planToWatch" },
  { value: "WATCHING", label: "Watching", count: "watching" },
  { value: "WATCHED", label: "Watched", count: "watched" },
  { value: "favorites", label: "Favourites", count: "favorites" },
  { value: "ratings", label: "Ratings", count: "ratings" },
];

const SORTS = {
  status: [["recent", "Recently changed"], ["rating", "Your rating"], ["release", "Release date"], ["title", "A to Z"]],
  set: [["recent", "Recently added"], ["release", "Release date, soonest"], ["title", "A to Z"]],
  ratings: [["recent", "Recently rated"], ["highest", "Highest first"], ["lowest", "Lowest first"], ["title", "A to Z"]],
};

const EMPTY = {
  wishlist: "Tap Wishlist on any film or series to keep it here.",
  PLAN_TO_WATCH: "Mark a title as Plan to watch and it lines up here.",
  WATCHING: "Series you're part-way through will wait here.",
  WATCHED: "Everything you rate, log or mark as watched collects here.",
  favorites: "Star the films you love. Your five come from here.",
  ratings: "Rate something out of ten from its page.",
};

const fetcherFor = (tab) => {
  if (tab === "wishlist") return (params) => libraryApi.wishlistItems(params);
  if (tab === "favorites") return (params) => libraryApi.favorites(params);
  if (tab === "ratings") return (params) => libraryApi.ratings(params);
  return (params) => libraryApi.library({ ...params, status: tab });
};

function GuestLibrary() {
  const items = useGuestWishlist();
  return (
    <AccountShell title="Library" subtitle={`${plural(items.length, "title")} saved in this browser`} actions={<LinkButton to="/register" variant="primary">Keep it in an account</LinkButton>}>
      <p className="mb-6 max-w-2xl text-[15px] text-muted">
        Your wishlist lives in this browser for now. Sign in and it moves to your account, where you can also track what you're watching, rate and keep a diary.
      </p>
      {items.length ? (
        <PosterGrid items={items} />
      ) : (
        <EmptyState title="Nothing saved yet">{EMPTY.wishlist}</EmptyState>
      )}
    </AccountShell>
  );
}

function MemberLibrary() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((item) => item.value === params.get("tab"))?.value || "wishlist";
  const mediaType = params.get("type") || "";
  const sort = params.get("sort") || "recent";
  const sortKind = tab === "ratings" ? "ratings" : tab === "wishlist" || tab === "favorites" ? "set" : "status";

  const { data: counts } = useQuery({ queryKey: ["me", "counts"], queryFn: libraryApi.counts });

  const query = useInfiniteQuery({
    queryKey: ["me", "library", tab, mediaType, sort],
    queryFn: ({ pageParam }) => fetcherFor(tab)({ page: pageParam, limit: 36, sort, ...(mediaType && tab !== "ratings" && { mediaType }) }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const items = query.data?.pages.flatMap((page) => page.items) || [];
  const total = query.data?.pages[0]?.totalRecords;

  const set = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next, { replace: true });
  };

  const watchedTotal = counts ? counts.watched : null;

  return (
    <AccountShell
      title="Library"
      subtitle={watchedTotal === null ? " " : `${plural(watchedTotal, "title")} watched · ${plural(counts.wishlist + counts.planToWatch, "title")} waiting`}
    >
      <Tabs
        label="Library lists"
        value={tab}
        onChange={(value) => set({ tab: value, sort: "" })}
        tabs={TABS.map((item) => ({ value: item.value, label: item.label, count: counts ? formatNumber(counts[item.count]) : undefined }))}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {tab !== "ratings" && (
          <Segmented
            size="sm"
            label="Type"
            value={mediaType}
            onChange={(value) => set({ type: value })}
            options={[{ value: "", label: "All" }, { value: "movie", label: "Films" }, { value: "tv", label: "Series" }]}
          />
        )}
        <span className="num ml-auto text-sm text-faint">{total !== undefined && plural(total, "title")}</span>
        <Select aria-label="Sort" value={sort} onChange={(event) => set({ sort: event.target.value })}>
          {SORTS[sortKind].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
      </div>

      <div className="mt-6">
        {query.isError ? (
          <ErrorState message="Your library didn't load." onRetry={() => query.refetch()} />
        ) : query.isSuccess && !items.length ? (
          <EmptyState title="Nothing here yet" action={<LinkButton to="/discover" variant="secondary">Find something to watch</LinkButton>}>
            {EMPTY[tab]}
          </EmptyState>
        ) : (
          <PosterGrid items={items} loading={query.isLoading} ratingOf={(item) => item.userRating} />
        )}
      </div>

      {query.hasNextPage && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
            {query.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
          <p className="num text-[13px] text-faint">{formatNumber(items.length)} of {formatNumber(total)}</p>
        </div>
      )}
    </AccountShell>
  );
}

function WatchList() {
  const { status } = useAuth();
  if (status === "loading") return <div className="min-h-[60vh]" />;
  return status === "member" ? <MemberLibrary /> : <GuestLibrary />;
}

export default WatchList;
