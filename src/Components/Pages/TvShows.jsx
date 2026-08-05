import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaSearch,
  FaTv,
  FaFilm,
  FaExclamationTriangle,
  FaPlay,
  FaFire,
  FaChevronRight,
} from "react-icons/fa";
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

// Skeleton Loader for Card Grid
function CardSkeleton() {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-zinc-800/50" />
      <div className="p-3.5 space-y-2">
        <div className="h-3.5 bg-zinc-800/60 rounded w-3/4" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-2.5 bg-zinc-800/60 rounded w-1/4" />
          <div className="h-2.5 bg-zinc-800/60 rounded w-1/5" />
        </div>
      </div>
    </div>
  );
}

// Skeleton Row for Category Swimlanes
function RowSkeleton() {
  return (
    <div className="space-y-4 mb-10">
      <div className="h-6 bg-zinc-800/60 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
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

  const [selectedGenre, setSelectedGenre] = useState("all");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);

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

  const featuredShow = useMemo(() => trending[0] || null, [trending]);

  const genres = [
    { id: "all", label: "All Categories" },
    { id: "drama", label: "Drama" },
    { id: "comedy", label: "Comedy" },
    { id: "crime", label: "Crime" },
    { id: "scifi", label: "Sci-Fi & Fantasy" },
  ];

  const categories = [
    { id: "trending", title: "Trending Shows", shows: trending },
    { id: "topRated", title: "Top Rated Classics", shows: topRated },
    { id: "popular", title: "Popular Series", shows: popular },
    { id: "airingToday", title: "Airing Today", shows: airingToday },
    { id: "onAir", title: "Currently On Air", shows: onAir },
    { id: "drama", title: "Drama Series", shows: drama, genreId: "drama" },
    { id: "comedy", title: "Comedy Hits", shows: comedy, genreId: "comedy" },
    { id: "crime", title: "Crime & Thrillers", shows: crime, genreId: "crime" },
    { id: "scifi", title: "Sci-Fi & Fantasy", shows: scifi, genreId: "scifi" },
  ];

  const filteredCategories = categories.filter((cat) => {
    if (selectedGenre === "all") return true;
    return cat.genreId === selectedGenre;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black relative">
      {/* Film grain noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Featured Spotlight Hero Section */}
      {!search.trim() && featuredShow && !isLoading && !hasError && (
        <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden border-b border-zinc-800/80">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform scale-105"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredShow.backdrop_path})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/40 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-end pb-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-3">
                <FaFire className="text-amber-500" />
                <span>#1 Trending Television Series</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white line-clamp-2">
                {featuredShow.name}
              </h1>

              <p className="text-zinc-300 text-sm md:text-base mt-3 line-clamp-3 leading-relaxed">
                {featuredShow.overview}
              </p>

              <div className="flex items-center gap-4 mt-6">
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-105">
                  <FaPlay className="text-xs" /> Watch Spotlight
                </button>
                <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-300">
                  <FaStar className="text-amber-400" />
                  <span>{featuredShow.vote_average?.toFixed(1)} Rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Sticky Search & Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search TV shows by title..."
              className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-amber-500/50 pl-11 pr-4 py-2.5 rounded-xl outline-none text-white text-sm placeholder-zinc-500 transition-all duration-200"
            />
          </div>

          {/* Filter Pills */}
          {!search.trim() && (
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
              {genres.map((g) => {
                const isActive = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                        : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content View */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative z-10">
        {/* Error Fallback */}
        {hasError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-lg">
              <FaExclamationTriangle className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Failed to load television catalog
            </h3>
            <p className="text-sm text-zinc-400 max-w-sm mb-6">
              We encountered an issue fetching show details from the service. Please try again.
            </p>
            <button
              onClick={loadHomePage}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-xs font-bold text-white rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : search.trim().length > 0 ? (
          /* Search Results Section */
          <section className="pb-16 min-h-[60vh]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <FaTv className="text-lg" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Search Results</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Showing results for "<span className="text-zinc-300">{search}</span>"
                </p>
              </div>
            </div>

            {isSearching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {[...Array(12)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : searchResult.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5"
              >
                <AnimatePresence>
                  {searchResult.map((show) => (
                    <motion.div
                      key={show.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-950/20 hover:-translate-y-1.5"
                    >
                      <div className="aspect-[2/3] overflow-hidden bg-zinc-950 relative">
                        <img
                          src={
                            show.poster_path
                              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                              : "https://placehold.co/500x750/181818/ffffff?text=No+Poster"
                          }
                          alt={show.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3.5">
                        <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {show.name}
                        </h3>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                          <span>
                            {show.first_air_date?.substring(0, 4) || "N/A"}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <FaStar className="text-[9px]" />
                            {show.vote_average?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Empty Search View */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                  <FaFilm className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-white">No Shows Found</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  We couldn't find any series matching "<span className="text-zinc-300">{search}</span>". Try another title.
                </p>
              </div>
            )}
          </section>
        ) : (
          /* Default Category Rows */
          <div className="flex flex-col gap-10 pb-16">
            {isLoading ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : (
              filteredCategories.map((cat) => {
                if (!cat.shows?.length) return null;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <HorizontalRow title={cat.title} shows={cat.shows} />
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default TvShows;