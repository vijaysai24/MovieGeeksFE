import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../../Services/catalogService";
import { identityApi, libraryApi } from "../../Services/userService";
import { formatDayMonth } from "../../Services/format";
import { useAuth } from "../../Context/AuthContext";
import { useRegion } from "../../Hooks/useRegion";
import Hero from "../Home/Hero";
import NowShowingBoard from "../Home/NowShowingBoard";
import TonightsPick from "../Home/TonightsPick";
import ComingSoon from "../Home/ComingSoon";
import HiddenGems from "../Home/HiddenGems";
import IdentityBoard from "../Home/IdentityBoard";
import ClosingQuestion from "../Home/ClosingQuestion";
import { PosterRow } from "../Movie/PosterRow";
import { ErrorState } from "../UI/States";

const reasonLine = (item) => {
  if (item.reason?.type === "SEVERAL") return `Like ${item.reason.seedCount} of your favourites`;
  if (item.reason?.because) return `Because you liked ${item.reason.because.title}`;
  return null;
};

// Members see their own shelves first: what they are part-way through, what they meant to watch,
// and what we think they will love next, each with its reason.
function MemberRows() {
  const watching = useQuery({ queryKey: ["me", "library", "WATCHING", "home"], queryFn: () => libraryApi.library({ status: "WATCHING", limit: 20 }) });
  const planned = useQuery({ queryKey: ["me", "library", "PLAN_TO_WATCH", "home"], queryFn: () => libraryApi.library({ status: "PLAN_TO_WATCH", limit: 20 }) });
  const recs = useQuery({ queryKey: ["me", "recommendations"], queryFn: identityApi.recommendations, staleTime: 10 * 60 * 1000 });

  return (
    <>
      <PosterRow
        className="page section-gap"
        title="Picked for You"
        subtitle={recs.data?.basis === "history" ? "From what you've loved and logged" : "Rate a few films and these get sharper"}
        items={recs.data?.items}
        loading={recs.isLoading}
        sublineOf={(item) => reasonLine(item) && <span className="truncate">{reasonLine(item)}</span>}
      />
      <PosterRow className="page section-gap" title="Still Watching" items={watching.data?.items} loading={watching.isLoading} href="/watchlist?tab=WATCHING" />
      <PosterRow className="page section-gap" title="Up Next" subtitle="On your watchlist" items={planned.data?.items} loading={planned.isLoading} href="/watchlist?tab=PLAN_TO_WATCH" />
    </>
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
      <Hero spotlight={home.data?.spotlight} loading={loading} />

      {home.isError && (
        <div className="page pt-10">
          <ErrorState message="Today's listings didn't load. Your library and diary still work." onRetry={() => home.refetch()} />
        </div>
      )}

      {isMember && <MemberRows />}

      <PosterRow className="page section-gap" title="Trending This Week" items={sections.trending} loading={loading} href="/discover?list=trending" />

      <NowShowingBoard
        inCinemas={sections.in_theatres}
        newOnStreaming={sections.new_on_streaming}
        comingToStreaming={sections.coming_to_streaming}
        loading={loading}
        region={region}
      />

      <TonightsPick region={region} />

      <ComingSoon items={sections.upcoming} loading={loading} />

      <PosterRow
        className="page section-gap"
        title="New on Streaming"
        subtitle="Arrived on services in the last two months"
        items={sections.new_on_streaming}
        loading={loading}
        href="/movies/ott"
        badgeOf={(item) => item.releaseDate && formatDayMonth(item.releaseDate)}
      />

      <PosterRow className="page section-gap" title="Series Everyone Is Watching" items={sections.popular_tv} loading={loading} href="/tvshows" />

      <HiddenGems items={sections.hidden_gems} />

      <PosterRow className="page section-gap" title="All-Time Greats" subtitle="The highest-rated films with a settled reputation" items={sections.top_rated} loading={loading} href="/discover?list=top_rated" />

      {!isMember && <IdentityBoard films={sections.top_rated} region={region} />}

      <ClosingQuestion />
    </>
  );
}

export default Home;
