import { useEffect, useMemo, useState } from "react";
import { FaFilm, FaSearch } from "react-icons/fa";

import {
  getNowPlayingMovies,
  getUpcomingMovies,
} from "../../Services/movieService";

function TheatricalMovies() {
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  const [search, setSearch] = useState("");

  const [genre, setGenre] = useState("");

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

      setNowPlaying(nowRes.data.results);

      setUpcoming(upcomingRes.data.results);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredNowPlaying = useMemo(() => {
    return nowPlaying.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, nowPlaying]);

  const filteredUpcoming = useMemo(() => {
    return upcoming.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, upcoming]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">

      <section className="border-b border-gray-800 bg-gradient-to-r from-red-900 via-black to-black">

        <div className="max-w-7xl mx-auto px-8 py-14">

          <div className="flex items-center gap-4">

            <FaFilm className="text-4xl text-red-500" />

            <div>

              <h1 className="text-5xl font-black">
                Theatrical Movies
              </h1>

              <p className="text-gray-300 mt-2">
                Explore movies currently showing in cinemas and upcoming theatrical releases.
              </p>

            </div>

          </div>

          <div className="mt-10 flex flex-wrap gap-4">

            <div className="relative flex-1 min-w-[300px]">

              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search theatrical movies..."
                className="w-full rounded-xl bg-[#1b1b1b] border border-gray-700 py-4 pl-14 pr-5 outline-none focus:border-red-500"
              />

            </div>

            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="rounded-xl bg-[#1b1b1b] border border-gray-700 px-5"
            >
              <option value="">All Genres</option>
              <option>Action</option>
              <option>Comedy</option>
              <option>Drama</option>
              <option>Adventure</option>
              <option>Animation</option>
              <option>Fantasy</option>
              <option>Horror</option>
            </select>

          </div>

        </div>

      </section>

      <div className="max-w-7xl mx-auto px-8 py-10">
              {loading ? (
        <div className="space-y-16">

          {[1, 2].map((section) => (
            <div key={section}>

              <div className="h-8 w-72 bg-gray-800 rounded animate-pulse mb-8" />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">

                {[...Array(12)].map((_, index) => (
                  <div
                    key={index}
                    className="h-[420px] rounded-2xl bg-[#1b1b1b] animate-pulse"
                  />
                ))}

              </div>

            </div>
          ))}

        </div>
      ) : (
        <>
          {/* NOW PLAYING */}

          <section className="mb-16">

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-4xl font-black">
                  🔥 Now Playing
                </h2>

                <p className="text-gray-400 mt-2">
                  Currently showing in theatres
                </p>

              </div>

              <span className="text-sm text-gray-500">
                {filteredNowPlaying.length} Movies
              </span>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-7">

              {filteredNowPlaying.map((movie) => (

                <div
                  key={movie.id}
                  className="group overflow-hidden rounded-2xl bg-[#171717] border border-gray-800 hover:border-red-500 transition duration-300 hover:-translate-y-2"
                >

                  <div className="relative">

                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "https://placehold.co/500x750/181818/666?text=No+Poster"
                      }
                      alt={movie.title}
                      className="w-full h-[340px] object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition" />

                    <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>

                  </div>

                  <div className="p-4">

                    <h3 className="font-bold line-clamp-2 group-hover:text-red-400">
                      {movie.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      {movie.release_date}
                    </p>

                    <button
                      className="mt-5 w-full rounded-lg bg-red-600 py-2 font-semibold hover:bg-red-700 transition"
                    >
                      View Details
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>

          {/* UPCOMING */}

          <section>

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-4xl font-black">
                  🎥 Coming Soon
                </h2>

                <p className="text-gray-400 mt-2">
                  Upcoming theatrical releases
                </p>

              </div>

              <span className="text-sm text-gray-500">
                {filteredUpcoming.length} Movies
              </span>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-7">

              {filteredUpcoming.map((movie) => (

                <div
                  key={movie.id}
                  className="group overflow-hidden rounded-2xl bg-[#171717] border border-gray-800 hover:border-blue-500 transition duration-300 hover:-translate-y-2"
                >

                  <div className="relative">

                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "https://placehold.co/500x750/181818/666?text=No+Poster"
                      }
                      alt={movie.title}
                      className="w-full h-[340px] object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition" />

                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Coming Soon
                    </span>

                  </div>

                  <div className="p-4">

                    <h3 className="font-bold line-clamp-2 group-hover:text-blue-400">
                      {movie.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      Releases on {movie.release_date}
                    </p>

                    <button
                      className="mt-5 w-full rounded-lg bg-blue-600 py-2 font-semibold hover:bg-blue-700 transition"
                    >
                      View Details
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>

        </>
      )}

    </div>
  </div>
);

}

export default TheatricalMovies;