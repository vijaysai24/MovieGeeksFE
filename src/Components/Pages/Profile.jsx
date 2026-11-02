import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { identityApi, socialApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { backdropSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { formatNumber } from "../../Services/format";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { Avatar } from "../UI/Avatar";
import { Button, LinkButton } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { Tabs } from "../UI/Tabs";
import { Skeleton, SkeletonText } from "../UI/States";
import { TopFiveEditor } from "../Movie/TopFiveEditor";
import { FilmDNA } from "../Profile/FilmDNA";
import { DiaryPanel, ListsPanel, OverviewPanel, ReviewsPanel, WatchlistPanel } from "../Profile/ProfilePanels";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "diary", label: "Diary", count: "diary" },
  { value: "lists", label: "Lists" },
  { value: "reviews", label: "Reviews", count: "reviews" },
  { value: "watchlist", label: "Watchlist" },
  { value: "dna", label: "Film DNA" },
];

function ConnectionsDialog({ username, direction, onClose }) {
  const query = useInfiniteQuery({
    queryKey: ["profile", username, direction],
    queryFn: ({ pageParam }) => socialApi.profileList(username, direction, { page: pageParam, limit: 30 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  const people = query.data?.pages.flatMap((page) => page.items) || [];

  return (
    <Dialog open onClose={onClose} title={direction === "followers" ? "Followers" : "Following"} size="sm">
      {query.isLoading && <Skeleton className="h-24 w-full" />}
      {query.isSuccess && !people.length && <p className="text-[15px] text-muted">{direction === "followers" ? "No followers yet." : "Not following anyone yet."}</p>}
      <ul className="-mx-2 max-h-[60vh] overflow-y-auto overscroll-contain">
        {people.map((person) => (
          <li key={person.id}>
            <Link to={`/u/${person.username}`} onClick={onClose} className="flex items-center gap-3 rounded-control px-2 py-2.5 can-hover:hover:bg-raised">
              <Avatar user={person} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium text-ink">{person.name}</span>
                <span className="block truncate text-[13px] text-faint">@{person.username}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {query.hasNextPage && <Button variant="secondary" full className="mt-3" onClick={() => query.fetchNextPage()}>Show More</Button>}
    </Dialog>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true">
      <Skeleton className="h-[34svh] min-h-[260px] w-full rounded-none md:h-[44svh]" />
      <div className="page -mt-16">
        <Skeleton className="h-28 w-28 rounded-full" />
        <Skeleton className="mt-6 h-14 w-72" />
        <SkeletonText className="mt-6 max-w-md" lines={2} />
      </div>
    </div>
  );
}

function Profile() {
  const { username } = useParams();
  const [params, setParams] = useSearchParams();
  const { isMember } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editingFive, setEditingFive] = useState(false);
  const [connections, setConnections] = useState(null);
  const tab = TABS.some((item) => item.value === params.get("tab")) ? params.get("tab") : "overview";

  const key = ["profile", username];
  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: key,
    queryFn: () => socialApi.profile(username),
  });
  // Shares its cache with the Film DNA tab for the current year.
  const { data: stats } = useQuery({
    queryKey: ["stats", username, new Date().getFullYear()],
    queryFn: () => identityApi.userStats(username, new Date().getFullYear()),
    enabled: Boolean(profile),
  });

  useEffect(() => {
    if (profile) document.title = `${profile.user.name} (@${profile.user.username}) · Cinefile`;
    return () => {
      document.title = "Cinefile";
    };
  }, [profile]);

  const follow = useMutation({
    mutationFn: () => (profile.viewerFollows ? socialApi.unfollow(username) : socialApi.follow(username)),
    onSuccess: (result) => {
      queryClient.setQueryData(key, (current) => ({ ...current, viewerFollows: result.viewerFollows, followers: result.followers }));
      queryClient.invalidateQueries({ queryKey: ["me", "feed"] });
    },
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  const selectTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === "overview") next.delete("tab");
    else next.set("tab", value);
    setParams(next);
  };

  if (isLoading) return <ProfileSkeleton />;

  if (isError) {
    const missing = error?.response?.status === 404;
    return (
      <div className="page pb-10 pt-32">
        <h1 className="display text-h1">{missing ? `There's no @${username} here` : "This profile didn't load"}</h1>
        <p className="mt-4 max-w-md text-read text-muted">{missing ? "The username may have changed, or the link is wrong." : "Try again in a moment."}</p>
        <div className="mt-8 flex gap-3">
          {!missing && <Button variant="primary" onClick={() => refetch()}>Try Again</Button>}
          <LinkButton to="/community" variant="secondary">Find Members</LinkButton>
        </div>
      </div>
    );
  }

  const { user, counts } = profile;
  const firstName = user.name.split(" ")[0];
  const bannerTitle = !user.bannerPath ? profile.topFive.find((title) => title.backdropPath) : null;
  const banner = user.bannerPath || bannerTitle?.backdropPath;
  const archetype = stats?.identity?.archetype;

  const figures = [
    ["Watched", counts.watched],
    ["Diary entries", counts.diary],
    ["Reviews", counts.reviews],
    ["Followers", profile.followers, "followers"],
    ["Following", profile.following, "following"],
  ];

  return (
    <>
      <section aria-labelledby="profile-name">
        <div className={`relative overflow-hidden ${banner ? "h-[34svh] min-h-[260px] bg-surface md:h-[44svh]" : "h-[200px] bg-linear-to-b from-surface to-ground md:h-[240px]"}`}>
          {banner && (
            <img src={tmdbImage(banner, "w1280")} srcSet={backdropSrcSet(banner)} sizes="100vw" alt="" width="1920" height="1080" fetchpriority="high" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
          )}
          {banner && <div className="scrim-bottom absolute inset-0" aria-hidden="true" />}
          {bannerTitle && (
            <Link to={titleHref(bannerTitle)} className="page absolute inset-x-0 bottom-4 hidden text-right text-[13px] text-muted can-hover:hover:text-ink md:block">
              {bannerTitle.title}, number one in {profile.isSelf ? "your" : "their"} five
            </Link>
          )}
        </div>

        <div className="page relative -mt-16 md:-mt-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">
              <Avatar user={user} size="hero" className="ring-4 ring-ground" />
              <div className="min-w-0">
                {archetype && <p className="text-ui font-medium text-accent">{archetype}</p>}
                <h1 id="profile-name" className="display mt-1 truncate text-[clamp(2.5rem,1.6rem+3vw,4.5rem)] leading-[1] text-ink">{user.name}</h1>
                <p className="mt-2 text-ui text-muted">@{user.username} · Member since {new Date(user.createdAt).getFullYear()}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {profile.isSelf ? (
                <LinkButton to="/settings" variant="secondary">Edit Profile</LinkButton>
              ) : isMember ? (
                <Button variant={profile.viewerFollows ? "secondary" : "accent"} onClick={() => follow.mutate()} disabled={follow.isPending} aria-pressed={profile.viewerFollows}>
                  {profile.viewerFollows ? "Following" : `Follow ${firstName}`}
                </Button>
              ) : (
                <LinkButton to="/login" variant="accent">Sign In to Follow</LinkButton>
              )}
            </div>
          </div>

          {user.bio && <p className="mt-6 max-w-[60ch] text-read text-ink">{user.bio}</p>}

          <dl className="num mt-8 flex flex-wrap gap-x-10 gap-y-5">
            {figures.map(([label, value, list]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-[13px] text-faint">{label}</dt>
                <dd className="text-[1.75rem] font-semibold leading-none text-ink">
                  {list ? (
                    <button type="button" onClick={() => setConnections(list)} className="can-hover:hover:text-accent" aria-label={`${formatNumber(value)} ${label}, show list`}>{formatNumber(value)}</button>
                  ) : formatNumber(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="sticky top-14 z-20 mt-12 bg-ground md:top-16">
        <Tabs
          className="page"
          label="Profile sections"
          value={tab}
          onChange={selectTab}
          tabs={TABS.map((item) => ({ value: item.value, label: item.label, count: item.count ? counts[item.count] || undefined : undefined }))}
        />
      </div>

      <div className="page mt-12 md:mt-16">
        {tab === "overview" && <OverviewPanel profile={profile} onEditFive={() => setEditingFive(true)} />}
        {tab === "diary" && <DiaryPanel username={user.username} name={user.name} isSelf={profile.isSelf} />}
        {tab === "lists" && <ListsPanel username={user.username} name={user.name} isSelf={profile.isSelf} />}
        {tab === "reviews" && <ReviewsPanel username={user.username} name={user.name} isSelf={profile.isSelf} />}
        {tab === "watchlist" && <WatchlistPanel profile={profile} />}
        {tab === "dna" && <FilmDNA username={user.username} name={firstName} isSelf={profile.isSelf} />}
      </div>

      {editingFive && <TopFiveEditor initial={profile.topFive} onClose={() => setEditingFive(false)} />}
      {connections && <ConnectionsDialog username={username} direction={connections} onClose={() => setConnections(null)} />}
    </>
  );
}

export default Profile;
