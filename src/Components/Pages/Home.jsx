import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../../Services/catalogService";
import { libraryApi } from "../../Services/userService";
import { useAuth } from "../../Context/AuthContext";
import { useRegion } from "../../Hooks/useRegion";
import Hero from "../Home/Hero";
import TonightsPick from "../Home/TonightsPick";
import Programme from "../Home/Programme";
import GemsGallery from "../Home/GemsGallery";
import IdentityFeatures from "../Home/IdentityFeatures";
import JoinField from "../Home/JoinField";
import { PosterRow } from "../Movie/PosterRow";
import { ErrorState } from "../UI/States";

// For members: what's already on their shelves, before anything new.
function MemberShelf() {
  const watching = useQuery({ queryKey: ["me", "library", "WATCHING", "home"], queryFn: () => libraryApi.library({ status: "WATCHING", limit: 20 }) });
  const planned = useQuery({ queryKey: ["me", "library", "PLAN_TO_WATCH", "home"], queryFn: () => libraryApi.library({ status: "PLAN_TO_WATCH", limit: 20 }) });
  const wishlist = useQuery({ queryKey: ["me", "library", "wishlist", "home"], queryFn: () => libraryApi.wishlistItems({ limit: 20 }) });

  const rows = [
    { title: "Still watching", query: watching, href: "/watchlist?tab=WATCHING" },
    { title: "Up next on your watchlist", query: planned, href: "/watchlist?tab=PLAN_TO_WATCH" },
    { title: "Your wishlist", query: wishlist, href: "/watchlist" },
  ].filter((row) => row.query.isLoading || row.query.data?.items.length);

  if (!rows.length) return null;

  return (
    <section aria-label="Your shelves" className="mx-auto mt-[clamp(120px,14vw,200px)] max-w-[1440px] space-y-14 px-4 md:px-8">
      {rows.map((row) => (
        <PosterRow
          key={row.title}
          title={row.title}
          items={row.query.data?.items}
          loading={row.query.isLoading}
          href={row.href}
          ratingOf={(item) => item.userRating}
        />
      ))}
    </section>
  );
}

function Home() {
  const { region } = useRegion();
  const { isMember } = useAuth();
  const home = useQuery({
    queryKey: ["catalog", "home", region],
    queryFn: () => catalogApi.home(region),
    staleTime: 5 * 60 * 1000,
  });

  const sections = Object.fromEntries((home.data?.sections || []).map((section) => [section.key, section.items]));
  const loading = home.isLoading;

  return (
    <>
      <Hero spotlight={home.data?.spotlight} loading={loading} region={region} />

      {home.isError && (
        <div className="mx-auto max-w-[1440px] px-4 pt-8 md:px-8">
          <ErrorState message="Today's listings didn't load. The rest of Movie Geeks still works." onRetry={() => home.refetch()} />
        </div>
      )}

      {isMember && <MemberShelf />}

      <TonightsPick region={region} />

      <Programme
        inCinemas={sections.in_theatres}
        comingSoon={sections.upcoming}
        newOnStreaming={sections.new_on_streaming}
        loading={loading}
        region={region}
      />

      <GemsGallery items={sections.hidden_gems} loading={loading} />

      <section aria-label="More to explore" className="mx-auto mt-[clamp(120px,14vw,200px)] max-w-[1440px] space-y-14 px-4 md:px-8">
        <PosterRow title="Trending this week" items={sections.trending} loading={loading} href="/discover?list=trending" />
        <PosterRow title="Series everyone is watching" items={sections.popular_tv} loading={loading} href="/tvshows" />
        <PosterRow title="All-time greats" items={sections.top_rated} loading={loading} href="/discover?list=top_rated" />
      </section>

      {!isMember && (
        <>
          <IdentityFeatures films={sections.top_rated} region={region} />
          <JoinField />
        </>
      )}
    </>
  );
}

export default Home;
