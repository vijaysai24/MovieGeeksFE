import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Bookmark, Eye, Heart, ListChecks, Star, Tv } from "lucide-react";
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
  { value: "PLAN_TO_WATCH", label: "Plan to Watch", count: "planToWatch" },
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
  wishlist: { icon: Heart, title: "Your wishlist is empty", body: "Tap the heart on any poster, or Wishlist on a title’s page, to keep it here." },
  PLAN_TO_WATCH: { icon: ListChecks, title: "Nothing planned yet", body: "Set a title to Plan to Watch from its page and it lines up here." },
  WATCHING: { icon: Tv, title: "Nothing in progress", body: "Series you’re part-way through wait here, so you never lose your place." },
  WATCHED: { icon: Eye, title: "Nothing watched yet", body: "Everything you rate, log or mark as watched collects here." },
  favorites: { icon: Star, title: "No favourites yet", body: "Star the films you love from their pages. Your five come from here." },
  ratings: { icon: Star, title: "No ratings yet", body: "Rate something out of ten from its page and it shows up here." },
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
    <AccountShell title="Library" subtitle={`${plural(items.length, "title")} saved in this browser`}>
      <div className="mb-10 flex flex-col gap-5 rounded-panel bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-7">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent text-accent-ink"><Bookmark size={20} aria-hidden="true" /></span>
          <div>
            <h2 className="text-h3 font-semibold text-ink">Keep your wishlist for good</h2>
            <p className="mt-1 max-w-[60ch] text-[15px] text-muted">It lives in this browser for now. Join and it moves to your account, where you can also track what you’re watching, rate and keep a diary.</p>
          </div>
        </div>
        <div className="flex flex-none gap-2">
          <LinkButton to="/register" variant="accent">Join Free</LinkButton>
          <LinkButton to="/login" variant="ghost">Sign In</LinkButton>
        </div>
      </div>
      {items.length ? (
        <PosterGrid items={items} />
      ) : (
        <EmptyState icon={EMPTY.wishlist.icon} title={EMPTY.wishlist.title} action={<LinkButton to="/discover" variant="primary">Find Something to Watch</LinkButton>}>{EMPTY.wishlist.body}</EmptyState>
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {tab !== "ratings" && (
          <Segmented
            size="sm"
            label="Type"
            value={mediaType}
            onChange={(value) => set({ type: value })}
            options={[{ value: "", label: "All" }, { value: "movie", label: "Films" }, { value: "tv", label: "Series" }]}
          />
        )}
        <span className="num ml-auto text-[14px] text-faint">{total !== undefined && plural(total, "title")}</span>
        <Select aria-label="Sort" value={sort} onChange={(event) => set({ sort: event.target.value })}>
          {SORTS[sortKind].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
      </div>

      <div className="mt-8">
        {query.isError ? (
          <ErrorState message="Your library didn't load." onRetry={() => query.refetch()} />
        ) : query.isSuccess && !items.length ? (
          <EmptyState icon={EMPTY[tab].icon} title={mediaType ? `No ${mediaType === "tv" ? "series" : "films"} here yet` : EMPTY[tab].title} action={<LinkButton to="/discover" variant="primary">Find Something to Watch</LinkButton>}>
            {EMPTY[tab].body}
          </EmptyState>
        ) : (
          <PosterGrid items={items} loading={query.isLoading} ratingOf={(item) => item.userRating} />
        )}
      </div>

      {query.hasNextPage && (
        <div className="mt-12 flex flex-col items-center gap-2">
          <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
            {query.isFetchingNextPage ? "Loading…" : "Show More"}
          </Button>
          <p className="num text-[13px] text-faint">{formatNumber(items.length)} of {formatNumber(total)}</p>
        </div>
      )}
    </AccountShell>
  );
}

function WatchList() {
  const { status } = useAuth();
  if (status === "loading") return <div className="min-h-[60vh]" aria-busy="true" />;
  return status === "member" ? <MemberLibrary /> : <GuestLibrary />;
}

export default WatchList;
