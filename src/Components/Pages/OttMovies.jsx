import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTv,
  FaSearch,
  FaStar,
  FaCalendarAlt,
  FaFilter,
  FaPlayCircle,
  FaFire,
  FaTicketAlt,
} from "react-icons/fa";

import HorizontalRow from "../Resuable Styling/HorizontalRow";

import {
  getNetflixMovies,
  getPrimeMovies,
  getDisneyMovies,
  getAppleMovies,
  getHotstarMovies,
} from "../../Services/movieService";

// PLATFORMS LIST
const PLATFORMS = [
  { id: "all", label: "All Platforms" },
  { id: "netflix", label: "🔥 Netflix" },
  { id: "prime", label: "📦 Prime Video" },
  { id: "disney", label: "🏰 Disney+" },
  { id: "apple", label: "🍎 Apple TV+" },
  { id: "hotstar", label: "⭐ JioHotstar" },
];

function OttMovies() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [netflix, setNetflix] = useState([]);
  const [prime, setPrime] = useState([]);
  const [disney, setDisney] = useState([]);
  const [apple, setApple] = useState([]);
  const [hotstar, setHotstar] = useState([]);

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    try {
      setLoading(true);
      const [
        netflixRes,
        primeRes,
        disneyRes,
        appleRes,
        hotstarRes,
      ] = await Promise.all([
        getNetflixMovies(),
        getPrimeMovies(),
        getDisneyMovies(),
        getAppleMovies(),
        getHotstarMovies(),
      ]);

      setNetflix(netflixRes?.data?.results || []);
      setPrime(primeRes?.data?.results || []);
      setDisney(disneyRes?.data?.results || []);
      setApple(appleRes?.data?.results || []);
      setHotstar(hotstarRes?.data?.results || []);
    } catch (err) {
      console.error("Failed to fetch OTT movies:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter helper logic
  const filterList = (list) => {
    if (!search.trim()) return list;
    return list.filter((item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.name?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredNetflix = useMemo(() => filterList(netflix), [netflix, search]);
  const filteredPrime = useMemo(() => filterList(prime), [prime, search]);
  const filteredDisney = useMemo(() => filterList(disney), [disney, search]);
  const filteredApple = useMemo(() => filterList(apple), [apple, search]);
  const filteredHotstar = useMemo(() => filterList(hotstar), [hotstar, search]);

  const heroMovie = netflix[0] || prime[0] || disney[0] || null;

  const totalMoviesCount =
    filteredNetflix.length +
    filteredPrime.length +
    filteredDisney.length +
    filteredApple.length +
    filteredHotstar.length;

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 font-sans selection:bg-purple-500 selection:text-white">
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
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase mb-3">
                <FaFire />
                <span>Featured Digital Release</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white line-clamp-2">
                {heroMovie.title || heroMovie.name}
              </h1>

              <p className="text-zinc-300 text-sm md:text-base mt-3 line-clamp-3 leading-relaxed">
                {heroMovie.overview}
              </p>

              <div className="flex items-center gap-4 mt-6">
                <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-950/40 hover:scale-105">
                  <FaPlayCircle className="text-xs" /> Watch Now
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
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search OTT movies..."
              className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-purple-500/50 pl-10 pr-4 py-2.5 rounded-xl outline-none text-white text-sm placeholder-zinc-500 transition-all duration-200"
            />
          </div>

          {/* SECTION SWITCH TABS */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 border border-zinc-800 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
            {PLATFORMS.map((tab) => {
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
                      layoutId="activeOttTabGlow"
                      className="absolute inset-0 bg-purple-600 rounded-lg shadow-md shadow-purple-950/50"
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
            {(activeTab === "all" || activeTab === "netflix") &&
              filteredNetflix.length > 0 && (
                <OttSectionWrapper
                  title="Trending on Netflix"
                  subtitle="Top digital hits streaming on Netflix"
                  icon="🔥"
                  shows={filteredNetflix}
                />
              )}

            {(activeTab === "all" || activeTab === "prime") &&
              filteredPrime.length > 0 && (
                <OttSectionWrapper
                  title="Prime Video Exclusives"
                  subtitle="Streaming on Amazon Prime"
                  icon="📦"
                  shows={filteredPrime}
                />
              )}

            {(activeTab === "all" || activeTab === "disney") &&
              filteredDisney.length > 0 && (
                <OttSectionWrapper
                  title="Disney+ Magic"
                  subtitle="Blockbusters & originals on Disney+"
                  icon="🏰"
                  shows={filteredDisney}
                />
              )}

            {(activeTab === "all" || activeTab === "apple") &&
              filteredApple.length > 0 && (
                <OttSectionWrapper
                  title="Apple TV+ Originals"
                  subtitle="Critically acclaimed Apple originals"
                  icon="🍎"
                  shows={filteredApple}
                />
              )}

            {(activeTab === "all" || activeTab === "hotstar") &&
              filteredHotstar.length > 0 && (
                <OttSectionWrapper
                  title="JioHotstar Favorites"
                  subtitle="Popular streaming titles on JioHotstar"
                  icon="⭐"
                  shows={filteredHotstar}
                />
              )}

            {/* EMPTY STATE */}
            {totalMoviesCount === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                  <FaTv className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-white">No Movies Found</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  We couldn't find any streaming titles matching your filters.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// SECTION CONTAINER
function OttSectionWrapper({ title, subtitle, icon, shows }) {
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
          {shows.length} {shows.length === 1 ? "Movie" : "Movies"}
        </span>
      </div>

      <HorizontalRow shows={shows} />
    </motion.section>
  );
}

// SKELETON LOADING STATE
function SkeletonLoader() {
  return (
    <div className="space-y-16">
      {[1, 2, 3].map((section) => (
        <div key={section}>
          <div className="h-7 w-48 bg-zinc-800/60 rounded-xl animate-pulse mb-6" />
          <div className="flex gap-5 overflow-hidden">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="min-w-[180px] md:min-w-[220px] aspect-[2/3] rounded-2xl bg-zinc-900/80 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default OttMovies;