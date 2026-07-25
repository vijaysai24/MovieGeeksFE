import { useEffect, useState, useCallback } from "react";
import { FaStar, FaSearch, FaTv, FaFilm, FaExclamationTriangle } from "react-icons/fa";
import {
  getTrendingTV,
  getPopularTV,
  getTopRatedTV,
  getOnAirTV,
  getAiringTodayTV,
  getTVByGenre,
  searchTV,
} from "../../Services/tmdbService";

import HorizontalRow from "../Resuable Styling/HorizontalRow";

// Skeleton Loader for Card Grid / Swimlanes
function CardSkeleton() {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-[#1a1a1a]" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-[#1a1a1a] rounded w-3/4" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-2.5 bg-[#1a1a1a] rounded w-1/4" />
          <div className="h-2.5 bg-[#1a1a1a] rounded w-1/5" />
        </div>
      </div>
    </div>
  );
}

// Skeleton Row for Category Rows during initial load
function RowSkeleton() {
  return (
    <div className="space-y-3 mb-8">
      <div className="h-5 bg-[#1a1a1a] rounded w-40 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function TvShows() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [onAir, setOnAir] = useState([]);
  const [airingToday, setAiringToday] = useState([]);

  const [drama, setDrama] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [crime, setCrime] = useState([]);
  const [scifi, setScifi] = useState([]);

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadHomePage();
  }, []);

  async function loadHomePage() {
    setIsLoading(true);
    setHasError(false);
    try {
      const [
        trendingRes,
        popularRes,
        topRatedRes,
        onAirRes,
        airingTodayRes,
        dramaRes,
        comedyRes,
        crimeRes,
        scifiRes,
      ] = await Promise.all([
        getTrendingTV(),
        getPopularTV(),
        getTopRatedTV(),
        getOnAirTV(),
        getAiringTodayTV(),
        getTVByGenre(18), // Drama
        getTVByGenre(35), // Comedy
        getTVByGenre(80), // Crime
        getTVByGenre(10765), // Sci-Fi & Fantasy
      ]);

      setTrending(trendingRes.data.results || []);
      setPopular(popularRes.data.results || []);
      setTopRated(topRatedRes.data.results || []);
      setOnAir(onAirRes.data.results || []);
      setAiringToday(airingTodayRes.data.results || []);

      setDrama(dramaRes.data.results || []);
      setComedy(comedyRes.data.results || []);
      setCrime(crimeRes.data.results || []);
      setScifi(scifiRes.data.results || []);
    } catch (err) {
      console.error("Error loading TV shows", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  // Search logic with debouncing
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResult([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await searchTV(query);
      setSearchResult(res.data.results || []);
    } catch (err) {
      console.error("Error searching TV shows", err);
      setSearchResult([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, handleSearch]);

  const categories = [
    { id: "trending", title: "Trending Shows", shows: trending },
    { id: "topRated", title: "Top Rated Classics", shows: topRated },
    { id: "popular", title: "Popular Series", shows: popular },
    { id: "airingToday", title: "Airing Today", shows: airingToday },
    { id: "onAir", title: "Currently On Air", shows: onAir },
    { id: "drama", title: "Drama", shows: drama },
    { id: "comedy", title: "Comedy", shows: comedy },
    { id: "crime", title: "Crime", shows: crime },
    { id: "scifi", title: "Sci-Fi & Fantasy", shows: scifi },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e6e3] selection:bg-amber-500 selection:text-black font-sans relative">
      {/* Film grain noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] text-sm" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Explore TV shows by title..."
              className="w-full bg-[#111] border border-[#222] focus:border-amber-500/40 pl-11 pr-4 py-3 rounded-xl outline-none text-white text-sm placeholder-[#555] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* --- Main Content Section --- */}
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Error Fallback */}
        {hasError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
              <FaExclamationTriangle className="text-xl" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Failed to load television catalog</h3>
            <p className="text-sm text-[#666] max-w-sm mb-5">
              We encountered an issue fetching show details from the database.
            </p>
            <button
              onClick={loadHomePage}
              className="px-4 py-2 bg-[#161616] border border-[#2a2a2a] hover:border-amber-500/40 text-xs font-semibold text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : search.trim().length > 0 ? (
          /* Search Results Section */
          <section className="pb-16 min-h-[60vh]">
            <div className="flex items-center gap-2 mb-6">
              <FaTv className="text-amber-500" />
              <h2 className="text-xl font-black text-white">Search Results</h2>
              <span className="text-[#555] text-sm">— "{search}"</span>
            </div>

            {isSearching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : searchResult.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResult.map((show) => (
                  <div
                    key={show.id}
                    className="bg-[#111] border border-[#222] hover:border-amber-500/40 rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="aspect-[2/3] overflow-hidden bg-[#181818] relative">
                      <img
                        src={
                          show.poster_path
                            ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                            : "https://placehold.co/500x750/111111/444444?text=No+Poster"
                        }
                        alt={show.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {show.name}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-[#666] mt-2">
                        <span>{show.first_air_date?.substring(0, 4) || "N/A"}</span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <FaStar className="text-[9px]" />
                          {show.vote_average?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Meaningful Empty Search View */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#222] flex items-center justify-center text-[#555] mb-4">
                  <FaFilm className="text-lg" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No Television Shows Found</h3>
                <p className="text-xs text-[#666] max-w-xs">
                  We couldn't find any series matching "<span className="text-[#888]">{search}</span>". Try searching for another title or keyword.
                </p>
              </div>
            )}
          </section>
        ) : (
          /* Default Category Rows */
          <div className="flex flex-col gap-8 pb-16">
            {isLoading ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : (
              categories.map((cat) => {
                if (!cat.shows?.length) return null;
                return <HorizontalRow key={cat.id} title={cat.title} shows={cat.shows} />;
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TvShows;