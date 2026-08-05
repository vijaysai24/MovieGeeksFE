import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeart,
  FaFilm,
  FaTv,
  FaCalendarAlt,
  FaStar,
  FaSearch,
  FaTrashAlt,
  FaSortAmountDown,
  FaThLarge,
  FaList,
  FaExternalLinkAlt,
  FaUndo,
  FaFire,
} from "react-icons/fa";

function WatchList() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");

  const initialWatchlist = [
    {
      id: 1,
      title: "Dune: Part Two",
      year: "2024",
      rating: 8.8,
      type: "theatrical",
      status: "Now Playing",
      platform: "Theatres",
      poster:
        "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    },
    {
      id: 2,
      title: "The Batman",
      year: "2022",
      rating: 8.1,
      type: "ott",
      status: "Available",
      platform: "Netflix",
      poster:
        "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    },
    {
      id: 3,
      title: "The Last of Us",
      year: "2023",
      rating: 8.9,
      type: "series",
      status: "Streaming",
      platform: "JioHotstar",
      poster:
        "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    },
    {
      id: 4,
      title: "Avatar 3",
      year: "2026",
      rating: 0,
      type: "upcoming",
      status: "Coming Soon",
      platform: "Theatres",
      poster:
        "https://placehold.co/500x750/181818/ffffff?text=Avatar+3",
    },
    {
      id: 5,
      title: "Mission Impossible",
      year: "2025",
      rating: 8.4,
      type: "theatrical",
      status: "Now Playing",
      platform: "Theatres",
      poster:
        "https://image.tmdb.org/t/p/w500/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
    },
    {
      id: 6,
      title: "Silo",
      year: "2024",
      rating: 8.2,
      type: "series",
      status: "Streaming",
      platform: "Apple TV+",
      poster:
        "https://image.tmdb.org/t/p/w500/7h7YdByF0W5J4FJQ4E2l8kdFMvx.jpg",
    },
  ];

  const [watchlist, setWatchlist] = useState(initialWatchlist);

  const handleRemove = (id) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setWatchlist(initialWatchlist);
    setSearchQuery("");
    setActiveTab("all");
    setSortBy("default");
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...watchlist];

    if (activeTab !== "all") {
      result = result.filter((item) => item.type === activeTab);
    }

    if (searchQuery.trim() !== "") {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "year") {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [watchlist, activeTab, searchQuery, sortBy]);

  const stats = useMemo(
    () => ({
      total: watchlist.length,
      theatrical: watchlist.filter((x) => x.type === "theatrical").length,
      ott: watchlist.filter((x) => x.type === "ott").length,
      series: watchlist.filter((x) => x.type === "series").length,
      upcoming: watchlist.filter((x) => x.type === "upcoming").length,
    }),
    [watchlist]
  );

  const tabs = [
    { id: "all", label: "All Items", count: stats.total, icon: FaFilm },
    { id: "theatrical", label: "Theatrical", count: stats.theatrical, icon: FaFilm },
    { id: "ott", label: "OTT Movies", count: stats.ott, icon: FaTv },
    { id: "series", label: "TV Shows", count: stats.series, icon: FaTv },
    { id: "upcoming", label: "Upcoming", count: stats.upcoming, icon: FaCalendarAlt },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400 selection:text-zinc-950">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-amber-500/10 via-zinc-950/60 to-zinc-950">
        <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-12 left-10 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-4 md:gap-5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/20 md:h-16 md:w-16">
                <FaHeart className="text-2xl md:text-3xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-zinc-100 md:text-4xl">
                    My Watchlist
                  </h1>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                    Pro
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400 md:text-sm">
                  Curate, track, and manage your personal cinema collection.
                </p>
              </div>
            </motion.div>

            {watchlist.length < initialWatchlist.length && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleReset}
                className="flex items-center gap-2 self-start rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:border-amber-500/40 hover:bg-zinc-800 hover:text-amber-400 sm:self-center"
              >
                <FaUndo className="text-xs" />
                <span>Restore Watchlist</span>
              </motion.button>
            )}
          </div>

          {/* Metric Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5"
          >
            <StatCard
              title="Total Saved"
              value={stats.total}
              icon={<FaFilm className="text-amber-400" />}
              highlight
            />
            <StatCard
              title="Theatrical"
              value={stats.theatrical}
              icon={<FaFire className="text-amber-400" />}
            />
            <StatCard
              title="OTT Movies"
              value={stats.ott}
              icon={<FaTv className="text-sky-400" />}
            />
            <StatCard
              title="TV Shows"
              value={stats.series}
              icon={<FaTv className="text-indigo-400" />}
            />
            <StatCard
              title="Upcoming"
              value={stats.upcoming}
              icon={<FaCalendarAlt className="text-emerald-400" />}
            />
          </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Controls Bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
                    isActive
                      ? "text-zinc-950 shadow-md shadow-amber-400/20"
                      : "border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 rounded-xl bg-amber-400"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="text-xs" />
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        isActive
                          ? "bg-zinc-950/20 text-zinc-950"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Sort & Layout Switcher */}
          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
            {/* Search */}
            <div className="relative flex-1 sm:w-60 sm:flex-none">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500" />
              <input
                type="text"
                placeholder="Filter titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder-zinc-500 backdrop-blur-md transition-colors focus:border-amber-400/60 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-400 backdrop-blur-md">
              <FaSortAmountDown className="text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer bg-transparent text-xs text-zinc-200 focus:outline-none"
              >
                <option value="default" className="bg-zinc-900">
                  Default Order
                </option>
                <option value="rating" className="bg-zinc-900">
                  Highest Rated
                </option>
                <option value="year" className="bg-zinc-900">
                  Latest Release
                </option>
                <option value="title" className="bg-zinc-900">
                  Alphabetical
                </option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden flex-none items-center rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-1 sm:flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-amber-400 text-zinc-950"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Grid View"
              >
                <FaThLarge className="text-xs" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-amber-400 text-zinc-950"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="List View"
              >
                <FaList className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <motion.div layout>
          <AnimatePresence mode="popLayout">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {filteredAndSorted.map((movie) => (
                  <motion.div
                    key={movie.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />

                      {/* Badge */}
                      <span className="absolute top-2.5 left-2.5 rounded-lg border border-zinc-700/60 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-zinc-200 backdrop-blur-md">
                        {movie.platform}
                      </span>

                      {/* Hover Overlay Action */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-zinc-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                        <button
                          onClick={() => handleRemove(movie.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/20 text-red-400 transition hover:bg-red-500 hover:text-white"
                          title="Remove item"
                        >
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-1 flex-col justify-between p-3.5">
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <FaStar className="text-[10px]" />
                            {movie.rating > 0 ? movie.rating : "TBA"}
                          </span>
                          <span className="font-semibold text-zinc-500">
                            {movie.year}
                          </span>
                        </div>
                        <h3 className="line-clamp-1 text-xs font-bold text-zinc-100 transition-colors group-hover:text-amber-400">
                          {movie.title}
                        </h3>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              movie.type === "upcoming"
                                ? "bg-amber-400"
                                : movie.type === "ott"
                                ? "bg-sky-400"
                                : "bg-emerald-400"
                            }`}
                          />
                          {movie.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List Mode */
              <div className="flex flex-col gap-3">
                {filteredAndSorted.map((movie) => (
                  <motion.div
                    key={movie.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="group relative flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 backdrop-blur-sm transition-all duration-200 hover:border-amber-500/40 hover:bg-zinc-900/80"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="h-16 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400">
                            {movie.title}
                          </h3>
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                            {movie.year}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <FaStar className="text-[10px]" />
                            {movie.rating > 0 ? movie.rating : "TBA"}
                          </span>
                          <span>•</span>
                          <span>{movie.platform}</span>
                          <span>•</span>
                          <span className="capitalize text-zinc-400">{movie.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="hidden text-xs font-semibold text-zinc-400 sm:inline">
                        {movie.status}
                      </span>
                      <button
                        onClick={() => handleRemove(movie.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                        title="Remove"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAndSorted.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="my-16 flex flex-col items-center justify-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 text-zinc-600">
              <FaFilm className="text-2xl" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-200">
              No matching titles
            </h3>
            <p className="mt-1 max-w-xs text-xs text-zinc-500">
              We couldn't find anything matching your search term or chosen category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
              className="mt-4 text-xs font-semibold text-amber-400 hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, highlight = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md transition-all ${
        highlight
          ? "border-amber-500/30 bg-amber-500/10"
          : "border-zinc-800/80 bg-zinc-900/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
          {title}
        </h4>
        <div className="text-sm">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-black text-zinc-100">{value}</p>
    </div>
  );
}

export default WatchList;