import { useMemo, useState } from "react";
import {
  FaHeart,
  FaFilm,
  FaTv,
  FaCalendarAlt,
  FaStar,
  FaClock,
} from "react-icons/fa";

function WatchList() {
  const [activeTab, setActiveTab] = useState("all");

  const watchlist = [
    {
      id: 1,
      title: "Dune: Part Two",
      year: "2024",
      rating: 8.7,
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
      rating: "-",
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

  const filtered = useMemo(() => {
    if (activeTab === "all") return watchlist;
    return watchlist.filter((item) => item.type === activeTab);
  }, [activeTab]);

  const stats = {
    total: watchlist.length,
    theatrical: watchlist.filter((x) => x.type === "theatrical").length,
    ott: watchlist.filter((x) => x.type === "ott").length,
    series: watchlist.filter((x) => x.type === "series").length,
    upcoming: watchlist.filter((x) => x.type === "upcoming").length,
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "theatrical", label: "🎬 Theatrical" },
    { id: "ott", label: "🍿 OTT Movies" },
    { id: "series", label: "📺 TV Shows" },
    { id: "upcoming", label: "🎥 Upcoming" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">

      <section className="bg-gradient-to-r from-red-900 via-[#111] to-[#111] border-b border-gray-800">

        <div className="max-w-7xl mx-auto px-8 py-14">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center">
              <FaHeart className="text-3xl" />
            </div>

            <div>

              <h1 className="text-5xl font-black">
                My Watchlist
              </h1>

              <p className="text-gray-400 mt-3">
                Every movie and series you've saved in one place.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-12">

            <StatCard title="Total Saved" value={stats.total} />
            <StatCard title="Theatrical" value={stats.theatrical} />
            <StatCard title="OTT Movies" value={stats.ott} />
            <StatCard title="TV Shows" value={stats.series} />
            <StatCard title="Upcoming" value={stats.upcoming} />

          </div>

        </div>

      </section>

      <div className="max-w-7xl mx-auto px-8 py-10">

        <div className="flex flex-wrap gap-3 mb-10">

          {tabs.map((tab) => (

            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-red-600"
                  : "bg-[#181818] hover:bg-[#242424]"
              }`}
            >
              {tab.label}
            </button>

          ))}

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7">

          {filtered.map((movie) => (

            <div
              key={movie.id}
              className="rounded-2xl overflow-hidden bg-[#171717] border border-gray-800 hover:border-red-500 transition hover:-translate-y-2"
            >

              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-[340px] object-cover"
              />

              <div className="p-4">

                <div className="flex justify-between">

                  <span className="text-yellow-400 flex items-center gap-1 text-sm">

                    <FaStar />

                    {movie.rating}

                  </span>

                  <span className="text-xs text-gray-400">
                    {movie.year}
                  </span>

                </div>

                <h3 className="font-bold mt-3 line-clamp-2">
                  {movie.title}
                </h3>

                <div className="flex items-center gap-2 mt-4 text-xs">

                  <span className="bg-red-600 px-2 py-1 rounded">
                    {movie.platform}
                  </span>

                  <span className="bg-gray-700 px-2 py-1 rounded">
                    {movie.status}
                  </span>

                </div>

                <button className="mt-5 w-full bg-[#262626] hover:bg-red-600 py-2 rounded-lg transition flex justify-center items-center gap-2">

                  <FaHeart />

                  Remove

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-[#171717] border border-gray-800 p-6">

      <h4 className="text-gray-400 text-sm">
        {title}
      </h4>

      <p className="text-4xl font-black mt-3">
        {value}
      </p>

    </div>
  );
}

export default WatchList;