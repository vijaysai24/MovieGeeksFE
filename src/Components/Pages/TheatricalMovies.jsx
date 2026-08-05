import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilm,
  FaSearch,
  FaStar,
  FaCalendarAlt,
  FaFilter,
  FaFire,
  FaPlay,
  FaTicketAlt,
} from "react-icons/fa";

import {
  getNowPlayingMovies,
  getUpcomingMovies,
} from "../../Services/movieService";

// TMDB Standard Genre Map
const GENRES = [
  { id: "", name: "All Genres" },
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "18", name: "Drama" },
  { id: "14", name: "Fantasy" },
  { id: "27", name: "Horror" },
];

function TheatricalMovies() {
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'nowPlaying' | 'upcoming'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    try {
      setLoading(true);
      const [nowRes, upcomingRes] = await Promise.all([
        getNowPlayingMovies(),
        getUpcomingMovies(),
      ]);

      setNowPlaying(nowRes.data.results || []);
      setUpcoming(upcomingRes.data.results || []);
    } catch (err) {
      console.error("Failed to load movies:", err);
    } finally {
      setLoading(false);
    }
  }

  // Helper filter logic for search & genre
  const filterMovies = (movies) => {
    return movies.filter((movie) => {
      const matchesSearch = movie.title
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesGenre = genre
        ? movie.genre_ids?.includes(Number(genre))
        : true;
      return matchesSearch && matchesGenre;
    });
  };

  const filteredNowPlaying = useMemo(
    () => filterMovies(nowPlaying),
    [search, genre, nowPlaying]
  );

  const filteredUpcoming = useMemo(
    () => filterMovies(upcoming),
    [search, genre, upcoming]
  );

  const heroMovie = nowPlaying[0] || null;

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* HERO SPOTLIGHT BANNER */}
      {heroMovie && !loading && !search && (
        <section className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden border-b border-zinc-800/80">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform scale-105"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/40 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-end pb-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs tracking-wider uppercase mb-3">
                <FaFire />
                <span>Featured Cinematic Release</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white line-clamp-2">
                {heroMovie.title}
              </h1>

              <p className="text-zinc-300 text-sm md:text-base mt-3 line-clamp-3 leading-relaxed">
                {heroMovie.overview}
              </p>

              <div className="flex items-center gap-4 mt-6">
                <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-rose-950/40 hover:scale-105">
                  <FaTicketAlt className="text-xs" /> Get Tickets
                </button>
                <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-300">
                  <FaStar className="text-amber-400" />
                  <span>{heroMovie.vote_average?.toFixed(1)} Rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* STICKY CONTROL & NAVIGATION BAR */}
      <div className="sticky top-0 z-40 bg-[#08080a]/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* SEARCH & GENRE INPUTS */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search theatrical titles..."
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-rose-500/50 pl-10 pr-4 py-2.5 rounded-xl outline-none text-white text-sm placeholder-zinc-500 transition-all duration-200"
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full sm:w-44 bg-zinc-900/80 border border-zinc-800 focus:border-rose-500/50 px-3.5 py-2.5 rounded-xl text-sm text-zinc-300 outline-none cursor-pointer"
              >
                {GENRES.map((g) => (
                  <option key={g.id} value={g.id} className="bg-zinc-900">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION SWITCH TABS */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 border border-zinc-800 rounded-xl w-full md:w-auto overflow-x-auto">
            {[
              { id: "all", label: "All Movies" },
              { id: "nowPlaying", label: "🔥 Now Playing" },
              { id: "upcoming", label: "🎥 Coming Soon" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-rose-600 rounded-lg shadow-md shadow-rose-950/50"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative z-10">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-16">
            {/* NOW PLAYING SECTION */}
            {(activeTab === "all" || activeTab === "nowPlaying") && (
              <MovieGridSection
                title="Now Playing"
                subtitle="In cinemas right now"
                icon="🔥"
                movies={filteredNowPlaying}
                badgeType="rating"
              />
            )}

            {/* UPCOMING SECTION */}
            {(activeTab === "all" || activeTab === "upcoming") && (
              <MovieGridSection
                title="Coming Soon"
                subtitle="Anticipated theatrical releases"
                icon="🎥"
                movies={filteredUpcoming}
                badgeType="upcoming"
              />
            )}

            {/* EMPTY STATE */}
            {filteredNowPlaying.length === 0 && filteredUpcoming.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                  <FaFilm className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-white">No Movies Found</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  We couldn't find any theatrical movies matching your filters.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// SECTION GRID COMPONENT
function MovieGridSection({ title, subtitle, icon, movies, badgeType }) {
  if (movies.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-end justify-between border-b border-zinc-800/80 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-zinc-400 text-xs mt-1">{subtitle}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
          {movies.length} {movies.length === 1 ? "Movie" : "Movies"}
        </span>
      </div>

      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        <AnimatePresence>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} badgeType={badgeType} />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}

// CLEAN MOVIE CARD
function MovieCard({ movie, badgeType }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-950/20"
    >
      {/* POSTER IMAGE CONTAINER */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "https://placehold.co/500x750/18181b/71717a?text=No+Poster"
          }
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* OVERLAY GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

        {/* BADGES */}
        {badgeType === "rating" ? (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/80 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-zinc-800">
            <FaStar className="text-[10px]" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-xl shadow-lg">
            Soon
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col justify-between p-3.5 bg-zinc-900/40">
        <div>
          <h3 className="font-bold text-xs md:text-sm text-zinc-100 line-clamp-1 group-hover:text-rose-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
            <FaCalendarAlt className="text-[9px] text-zinc-500" />
            <span>{movie.release_date ? movie.release_date.substring(0, 4) : "TBA"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// SKELETON LOADING STATE
function SkeletonLoader() {
  return (
    <div className="space-y-16">
      {[1, 2].map((section) => (
        <div key={section}>
          <div className="h-7 w-48 bg-zinc-800/60 rounded-xl animate-pulse mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="aspect-[2/3] rounded-2xl bg-zinc-900/80 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TheatricalMovies;