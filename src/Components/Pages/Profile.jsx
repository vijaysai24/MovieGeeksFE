import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { socialApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { backdropSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { formatDate, formatNumber, plural, timeAgo } from "../../Services/format";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { Avatar } from "../UI/Avatar";
import { Button, LinkButton } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { EmptyState, ErrorState, Skeleton, SkeletonText } from "../UI/States";
import { RatingValue } from "../UI/RatingInput";
import { Reveal } from "../UI/Reveal";
import { Poster, PosterCard } from "../Movie/PosterCard";
import { ReviewCard } from "../Movie/Reviews";
import { TopFiveEditor } from "../Movie/TopFiveEditor";

function SectionHeading({ id, children, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="display text-[clamp(2rem,2.6vw,2.5rem)] text-ink">{children}</h2>
      {action}
    </div>
  );
}

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
      {query.isSuccess && !people.length && <p className="text-sm text-muted">{direction === "followers" ? "No followers yet." : "Not following anyone yet."}</p>}
      <ul className="-mx-2 max-h-[60vh] overflow-y-auto">
        {people.map((person) => (
          <li key={person.id}>
            <Link to={`/u/${person.username}`} onClick={onClose} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-raised">
              <Avatar user={person} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{person.name}</span>
                <span className="block truncate text-[13px] text-faint">@{person.username}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {query.hasNextPage && <Button variant="secondary" full className="mt-3" onClick={() => query.fetchNextPage()}>More</Button>}
    </Dialog>
  );
}

function TheirFive({ profile, onEdit }) {
  const five = profile.topFive;
  const owner = profile.isSelf ? "Your" : `${profile.user.name.split(" ")[0]}'s`;

  return (
    <section aria-labelledby="five-title" className="mt-[clamp(112px,9vw,136px)]">
      <SectionHeading id="five-title" action={profile.isSelf && <Button variant="secondary" size="sm" onClick={onEdit}>{five.length ? "Change" : "Choose"}</Button>}>
        {owner} five
      </SectionHeading>
      {five.length ? (
        <Reveal index={1}>
          <ol className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {five.map((title) => (
              <li key={`${title.mediaType}:${title.id}`}>
                <Link to={titleHref(title)} className="group block">
                  <span className="block overflow-hidden rounded-[4px]">
                    <Poster path={title.posterPath} title={title.title} sizes="(min-width: 768px) 120px, 30vw" className="transition-transform duration-500 group-hover:scale-[1.04]" />
                  </span>
                  <span className="mt-2 block truncate text-[13px] text-muted group-hover:text-ink">{title.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </Reveal>
      ) : (
        <p className="mt-4 text-[15px] text-muted">
          {profile.isSelf ? "Pick the five films or series that say the most about you. They open your profile." : "Hasn't picked their five yet."}
        </p>
      )}
    </section>
  );
}

function RecentDiary({ username, isSelf }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile", username, "diary", "recent"],
    queryFn: () => socialApi.profileList(username, "diary", { limit: 6 }),
  });

  return (
    <section aria-labelledby="diary-title" className="mt-[clamp(112px,9vw,136px)]">
      <SectionHeading id="diary-title" action={isSelf && <Link to="/diary" className="text-sm text-muted hover:text-ink">Open diary</Link>}>
        Lately
      </SectionHeading>
      {isLoading && <SkeletonText className="mt-6" lines={4} />}
      {isError && <ErrorState className="mt-6" message="The diary didn't load." onRetry={refetch} />}
      {data && !data.items.length && <p className="mt-4 text-[15px] text-muted">{isSelf ? "Log a film from its page and it appears here." : "Nothing logged yet."}</p>}
      {data?.items.length > 0 && (
        <ul className="mt-6 space-y-1">
          {data.items.map((entry) => (
            <li key={entry.id}>
              <Link to={titleHref(entry.title)} className="group flex items-center gap-4 rounded-lg py-2">
                <span className="num w-16 flex-none text-[13px] text-faint">{formatDate(entry.watchedOn).replace(/ \d{4}$/, "")}</span>
                <span className="w-8 flex-none overflow-hidden rounded-[2px]"><Poster path={entry.title.posterPath} title={entry.title.title} sizes="32px" /></span>
                <span className="min-w-0 flex-1 truncate text-[15px] text-ink group-hover:text-accent">
                  {entry.title.title}
                  {entry.isRewatch && <span className="ml-2 text-[13px] text-faint">rewatch</span>}
                </span>
                <RatingValue value={entry.rating} className="flex-none text-sm" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {data?.totalRecords > 6 && <p className="num mt-3 text-[13px] text-faint">{plural(data.totalRecords, "entry", "entries")} in all</p>}
    </section>
  );
}

function RecentReviews({ username, name, isSelf }) {
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", "user", username],
    queryFn: () => socialApi.profileList(username, "reviews", { limit: 3 }),
  });
  if (isLoading) return <Skeleton className="mt-16 h-40 w-full" />;
  if (!data?.items.length) return null;

  return (
    <section aria-labelledby="reviews-title" className="mt-[clamp(112px,9vw,136px)]">
      <SectionHeading id="reviews-title">{isSelf ? "Your reviews" : `${name.split(" ")[0]}'s reviews`}</SectionHeading>
      <div>{data.items.map((review) => <ReviewCard key={review.id} review={review} showTitle />)}</div>
      {data.totalRecords > 3 && <p className="num text-[13px] text-faint">{plural(data.totalRecords, "review")} in all</p>}
    </section>
  );
}

function Favourites({ username }) {
  const { data } = useQuery({
    queryKey: ["profile", username, "favorites"],
    queryFn: () => socialApi.profileList(username, "favorites", { limit: 12 }),
  });
  if (!data?.items.length) return null;

  return (
    <section aria-labelledby="favourites-title" className="mt-[clamp(112px,9vw,136px)]">
      <SectionHeading id="favourites-title">Favourites</SectionHeading>
      <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4">
        {data.items.map((title) => <PosterCard key={`${title.mediaType}:${title.id}`} item={title} sizes="140px" userRating={title.userRating} />)}
      </div>
    </section>
  );
}

const ACTIVITY_VERBS = {
  RATED: "rated",
  REVIEWED: "reviewed",
  WATCHED: "watched",
  FAVORITED: "added to favourites",
  LISTED: "made a list",
  FOLLOWED: "followed",
};

function Activity({ username }) {
  const { data } = useQuery({
    queryKey: ["profile", username, "activity"],
    queryFn: () => socialApi.profileList(username, "activity", { limit: 8 }),
  });
  if (!data?.items.length) return null;

  return (
    <section aria-labelledby="activity-title" className="mt-[clamp(112px,9vw,136px)]">
      <SectionHeading id="activity-title">Recent activity</SectionHeading>
      <ul className="mt-6 space-y-3">
        {data.items.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4 text-[15px]">
            <span className="min-w-0 text-muted">
              {ACTIVITY_VERBS[item.type]}{" "}
              {item.title && <Link to={titleHref(item.title)} className="text-ink hover:text-accent">{item.title.title}</Link>}
              {item.followed && <Link to={`/u/${item.followed.username}`} className="text-ink hover:text-accent">{item.followed.name}</Link>}
              {item.rating && <span className="num text-accent"> {item.rating} /10</span>}
            </span>
            <span className="flex-none text-[13px] text-faint">{timeAgo(item.createdAt)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Profile() {
  const { username } = useParams();
  const { isMember } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editingFive, setEditingFive] = useState(false);
  const [connections, setConnections] = useState(null);

  const key = ["profile", username];
  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: key,
    queryFn: () => socialApi.profile(username),
  });

  const follow = useMutation({
    mutationFn: () => (profile.viewerFollows ? socialApi.unfollow(username) : socialApi.follow(username)),
    onSuccess: (result) => {
      queryClient.setQueryData(key, (current) => ({ ...current, viewerFollows: result.viewerFollows, followers: result.followers }));
      queryClient.invalidateQueries({ queryKey: ["me", "feed"] });
    },
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  if (isLoading) {
    return (
      <div className="md:grid md:grid-cols-[45fr_55fr]">
        <Skeleton className="h-[40svh] rounded-none md:h-[calc(100svh-64px)]" />
        <div className="bg-paper px-5 py-12 md:px-14"><Skeleton className="h-24 w-24 rounded-full" /><Skeleton className="mt-6 h-12 w-2/3" /><SkeletonText className="mt-8" /></div>
      </div>
    );
  }

  if (isError) {
    const missing = error?.response?.status === 404;
    return (
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8">
        <h1 className="display text-5xl">{missing ? `There's no @${username} here` : "This profile didn't load"}</h1>
        <div className="mt-8 flex gap-3">
          {!missing && <Button variant="primary" onClick={() => refetch()}>Try again</Button>}
          <LinkButton to="/community" variant="secondary">Find members</LinkButton>
        </div>
      </div>
    );
  }

  const { user, counts } = profile;
  const banner = user.bannerPath || profile.topFive.find((title) => title.backdropPath)?.backdropPath;
  const bannerTitle = !user.bannerPath ? profile.topFive.find((title) => title.backdropPath) : null;

  const figures = [
    ["Watched", counts.watched, null],
    ["Diary", counts.diary, null],
    ["Reviews", counts.reviews, null],
    ["Followers", profile.followers, "followers"],
    ["Following", profile.following, "following"],
  ];

  return (
    <>
      <div className="md:grid md:grid-cols-[45fr_55fr]">
        <div className="sticky top-14 h-[44svh] bg-raised md:top-16 md:h-[calc(100svh-64px)]">
          {banner ? (
            <>
              <img src={tmdbImage(banner, "w1280")} srcSet={backdropSrcSet(banner)} sizes="(min-width: 768px) 45vw, 100vw" alt="" width="1280" height="720" className="h-full w-full object-cover" />
              {bannerTitle && (
                <Link to={titleHref(bannerTitle)} className="absolute inset-x-0 bottom-0 hidden bg-paper px-5 py-4 text-[15px] text-muted hover:text-ink md:block">
                  {bannerTitle.title} <span className="text-faint">· number one in {profile.isSelf ? "your" : "their"} five</span>
                </Link>
              )}
            </>
          ) : (
            <div className="flex h-full items-end p-8"><Avatar user={user} size="xl" /></div>
          )}
        </div>

        <article className="relative z-10 -mt-[8svh] bg-paper px-5 pb-16 pt-10 md:mt-0 md:px-14 md:pt-16 lg:px-[72px]">
          <div className="max-w-[640px]">
            <Reveal className="flex items-center gap-5">
              <Avatar user={user} size="lg" />
              <div className="min-w-0">
                <h1 className="display truncate text-[clamp(2.5rem,4.4vw,4rem)] text-ink">{user.name}</h1>
                <p className="mt-1 text-[15px] text-faint">@{user.username} · member since {new Date(user.createdAt).getFullYear()}</p>
              </div>
            </Reveal>

            {user.bio && <Reveal index={1}><p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-ink">{user.bio}</p></Reveal>}

            <Reveal index={2} className="mt-8 flex flex-wrap items-center gap-3">
              {profile.isSelf ? (
                <LinkButton to="/settings" variant="secondary">Edit profile</LinkButton>
              ) : isMember ? (
                <Button variant={profile.viewerFollows ? "secondary" : "primary"} onClick={() => follow.mutate()} disabled={follow.isPending}>
                  {profile.viewerFollows ? "Following" : `Follow ${user.name.split(" ")[0]}`}
                </Button>
              ) : (
                <LinkButton to="/login" variant="primary">Sign in to follow</LinkButton>
              )}
            </Reveal>

            <Reveal index={3}>
              <dl className="num mt-10 grid grid-cols-3 gap-y-6 sm:grid-cols-5">
                {figures.map(([label, value, list]) => (
                  <div key={label}>
                    <dt className="text-[13px] text-faint">{label}</dt>
                    <dd className="mt-1">
                      {list ? (
                        <button type="button" onClick={() => setConnections(list)} className="text-2xl text-ink hover:text-accent">{formatNumber(value)}</button>
                      ) : (
                        <span className="text-2xl text-ink">{formatNumber(value)}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <TheirFive profile={profile} onEdit={() => setEditingFive(true)} />
            <RecentDiary username={username} isSelf={profile.isSelf} />
            <RecentReviews username={username} name={user.name} isSelf={profile.isSelf} />
            <Favourites username={username} />
            <Activity username={username} />

            {!counts.watched && !counts.reviews && (
              <EmptyState className="mt-16" title={profile.isSelf ? "Your profile fills in as you watch" : "Nothing here yet"}>
                {profile.isSelf ? "Rate, log or review anything and it shows up here." : `${user.name.split(" ")[0]} hasn't logged anything yet.`}
              </EmptyState>
            )}
          </div>
        </article>
      </div>

      {editingFive && <TopFiveEditor initial={profile.topFive} onClose={() => setEditingFive(false)} />}
      {connections && <ConnectionsDialog username={username} direction={connections} onClose={() => setConnections(null)} />}
    </>
  );
}

export default Profile;
