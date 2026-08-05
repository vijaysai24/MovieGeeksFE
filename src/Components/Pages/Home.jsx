import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaStar,
  FaPlay,
  FaFire,
  FaExclamationTriangle,
  FaInfoCircle,
  FaFilm,
  FaPlus,
  FaTimes,
  FaCompass,
} from "react-icons/fa";

import {
  getTrendingMovies,
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMoviesByGenre,
  searchMovies,
} from "../../Services/movieService";

import HorizontalRow from "../Resuable Styling/HorizontalRow";

// GENRE QUICK FILTER CHIPS
const QUICK_FILTERS = [
  { id: "all", name: "All Overview" },
  { id: "action", name: "Action", genreId: 28 },
  { id: "comedy", name: "Comedy", genreId: 35 },
  { id: "horror", name: "Horror", genreId: 27 },
  { id: "romance", name: "Romance", genreId: 10749 },
  { id: "scifi", name: "Sci-Fi", genreId: 878 },
];

function Home() {
  const [featured, setFeatured] = useState(null);

  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  const [action, setAction] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [horror, setHorror] = useState([]);
  const [romance, setRomance] = useState([]);
  const [scifi, setScifi] = useState([]);

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    setLoading(true);

    try {
      const [
        trendingRes,
        nowPlayingRes,
        popularRes,
        topRatedRes,
        upcomingRes,
        actionRes,
        comedyRes,
        horrorRes,
        romanceRes,
        scifiRes,
      ] = await Promise.all([
        getTrendingMovies(),
        getNowPlayingMovies(),
        getPopularMovies(),
        getTopRatedMovies(),
        getUpcomingMovies(),
        getMoviesByGenre(28),
        getMoviesByGenre(35),
        getMoviesByGenre(27),
        getMoviesByGenre(10749),
        getMoviesByGenre(878),
      ]);

      setTrending(trendingRes?.data?.results || []);
      setPopular(popularRes?.data?.results || []);
      setTopRated(topRatedRes?.data?.results || []);
      setNowPlaying(nowPlayingRes?.data?.results || []);
      setUpcoming(upcomingRes?.data?.results || []);

      setAction(actionRes?.data?.results || []);
      setComedy(comedyRes?.data?.results || []);
      setHorror(horrorRes?.data?.results || []);
      setRomance(romanceRes?.data?.results || []);
      setScifi(scifiRes?.data?.results || []);

      const firstMovie = trendingRes?.data?.results?.[0];
      setFeatured(firstMovie || null);

      setError(false);
    } catch (err) {
      console.error("Failed to load movies:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResult([]);
      return;
    }

    setSearchLoading(true);

    try {
      const res = await searchMovies(query);
      setSearchResult(res?.data?.results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, handleSearch]);

  const allRows = useMemo(
    () => [
      { id: "trending", title: "Trending Worldwide", movies: trending, icon: "🔥" },
      { id: "nowPlaying", title: "Now In Theaters", movies: nowPlaying, icon: "🎬" },
      { id: "popular", title: "Most Popular Right Now", movies: popular, icon: "🍿" },
      { id: "topRated", title: "Critically Acclaimed", movies: topRated, icon: "⭐" },
      { id: "upcoming", title: "Anticipated Releases", movies: upcoming, icon: "🎥" },
      { id: "action", title: "High Octane Action", movies: action, icon: "💥" },
      { id: "comedy", title: "Laugh Out Loud Comedies", movies: comedy, icon: "😂" },
      { id: "horror", title: "Chilling Horror", movies: horror, icon: "😱" },
      { id: "romance", title: "Romantic Hits", movies: romance, icon: "❤️" },
      { id: "scifi", title: "Sci-Fi & Cyberpunk", movies: scifi, icon: "🚀" },
    ],
    [trending, nowPlaying, popular, topRated, upcoming, action, comedy, horror, romance, scifi]
  );

  const displayedRows = useMemo(() => {
    if (activeFilter === "all") return allRows;
    return allRows.filter((row) => row.id === activeFilter || row.id === "trending");
  }, [allRows, activeFilter]);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 font-sans selection:bg-red-600 selection:text-white">
      {/* FEATURED HERO BANNER */}
      <AnimatePresence>
        {featured && !loading && !search && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-[70vh] md:h-[82vh] overflow-hidden border-b border-zinc-800/80"
          >
            {/* BACKDROP IMAGE */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform scale-105"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${featured.backdrop_path})`,
              }}
            />

            {/* GRADIENT OVERLAYS */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/70 to-transparent" />

            {/* HERO CONTENT */}
            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-end pb-16 z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="max-w-2xl"
              >
                {/* FEATURED BADGE */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-widest mb-4 backdrop-blur-md">
                  <FaFire className="text-red-500" />
                  <span>Spotlight Release</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                  {featured.title}
                </h1>

                {/* METADATA */}
                <div className="flex items-center gap-5 mt-4 text-xs md:text-sm font-semibold text-zinc-300">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <FaStar />
                    <strong className="text-white">{featured.vote_average?.toFixed(1)}</strong>
                  </span>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                  <span>{featured.release_date?.substring(0, 4)}</span>
                  <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                  <span className="border border-zinc-700 px-2 py-0.5 rounded text-[10px] text-zinc-400 uppercase tracking-wider">
                    {featured.original_language}
                  </span>
                </div>

                {/* OVERVIEW */}
                <p className="mt-4 text-sm md:text-base text-zinc-300/90 leading-relaxed line-clamp-3 md:line-clamp-4 max-w-xl font-normal">
                  {featured.overview}
                </p>

                {/* CTA BUTTONS */}
                <div className="flex items-center gap-4 mt-8">
                  <button className="flex items-center gap-2.5 bg-red-600 hover:bg-red-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-red-950/50 hover:scale-[1.02] active:scale-95 text-sm">
                    <FaPlay className="text-xs" /> Watch Trailer
                  </button>
                  <button className="flex items-center gap-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-zinc-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-sm">
                    <FaInfoCircle className="text-zinc-400" /> Details
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* STICKY SEARCH & CATEGORY BAR */}
      <div className="sticky top-0 z-40 bg-[#08080a]/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* SEARCH FIELD */}
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies, genres, cast..."
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-red-500/50 pl-11 pr-10 py-2.5 rounded-xl outline-none text-white text-sm placeholder-zinc-500 transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* FILTER CHIPS (ONLY SHOWN WHEN NOT SEARCHING) */}
          {!search && (
            <div className="flex items-center gap-2 bg-zinc-900/90 p-1.5 border border-zinc-800 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
              {QUICK_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeHomeChip"
                        className="absolute inset-0 bg-red-600 rounded-lg shadow-md shadow-red-950/40"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{filter.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINERS */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {error ? (
          /* ERROR STATE */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
              <FaExclamationTriangle className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-white">Connection Error</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              We couldn't connect to TMDB services. Check your connection or retry.
            </p>
            <button
              onClick={loadMovies}
              className="mt-6 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all"
            >
              Retry Loading
            </button>
          </div>
        ) : search.trim() ? (
          /* SEARCH RESULTS VIEW */
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <FaCompass className="text-red-500 text-xl" />
                <h2 className="text-xl md:text-2xl font-black text-white">
                  Search Results
                </h2>
                <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                  "{search}"
                </span>
              </div>
              <span className="text-xs text-zinc-500">
                {searchResult.length} items found
              </span>
            </div>

            {searchLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
                  />
                ))}
              </div>
            ) : searchResult.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {searchResult.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-black/50"
                  >
                    <div className="aspect-[2/3] overflow-hidden bg-zinc-950">
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "https://placehold.co/500x750/111/666?text=No+Poster"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
                      <h3 className="text-xs md:text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-zinc-400">
                        <span>{movie.release_date?.substring(0, 4) || "N/A"}</span>
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <FaStar className="text-[10px]" />
                          {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FaFilm className="text-4xl text-zinc-600 mb-3" />
                <h3 className="text-base font-bold text-white">No Results Found</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Try searching for another movie title or character.
                </p>
              </div>
            )}
          </section>
        ) : loading ? (
          /* SKELETON LOADER */
          <div className="space-y-12">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-6 w-52 bg-zinc-800/60 rounded-xl animate-pulse mb-5" />
                <div className="flex gap-5 overflow-hidden">
                  {[...Array(6)].map((_, j) => (
                    <div
                      key={j}
                      className="min-w-[180px] md:min-w-[220px] aspect-[2/3] rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* CATEGORY ROWS VIEW */
          <div className="space-y-14">
            {displayedRows.map((row) =>
              row.movies && row.movies.length > 0 ? (
                <section key={row.id} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{row.icon}</span>
                      <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                        {row.title}
                      </h2>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                      {row.movies.length} Titles
                    </span>
                  </div>
                  <HorizontalRow shows={row.movies} />
                </section>
              ) : null
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;