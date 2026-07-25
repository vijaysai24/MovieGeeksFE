import { useEffect, useState, useCallback } from "react";
import {
  FaSearch,
  FaStar,
  FaPlay,
  FaFire,
  FaExclamationTriangle,
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

      setTrending(trendingRes.data.results);
      setPopular(popularRes.data.results);
      setTopRated(topRatedRes.data.results);
      setNowPlaying(nowPlayingRes.data.results);
      setUpcoming(upcomingRes.data.results);

      setAction(actionRes.data.results);
      setComedy(comedyRes.data.results);
      setHorror(horrorRes.data.results);
      setRomance(romanceRes.data.results);
      setScifi(scifiRes.data.results);

      setFeatured(trendingRes.data.results[0]);

      setError(false);
    } catch (err) {
      console.log(err);
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
      setSearchResult(res.data.results);
    } catch (err) {
      console.log(err);
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

  const rows = [
    { title: "🔥 Trending Movies", movies: trending },
    { title: "🎬 Now Playing", movies: nowPlaying },
    { title: "🍿 Popular Movies", movies: popular },
    { title: "⭐ Top Rated", movies: topRated },
    { title: "🎥 Upcoming", movies: upcoming },
    { title: "💥 Action", movies: action },
    { title: "😂 Comedy", movies: comedy },
    { title: "😱 Horror", movies: horror },
    { title: "❤️ Romance", movies: romance },
    { title: "🚀 Science Fiction", movies: scifi },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">

      {featured && (
        <section
          className="relative h-[90vh] bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${featured.backdrop_path})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-10">

            <div className="max-w-xl">

              <p className="uppercase tracking-[5px] text-red-500 font-bold">
                Featured Movie
              </p>

              <h1 className="text-7xl font-black mt-5">
                {featured.title}
              </h1>

              <div className="flex gap-8 mt-6 text-gray-300">

                <span className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  {featured.vote_average.toFixed(1)}
                </span>

                <span>
                  {featured.release_date?.substring(0, 4)}
                </span>

              </div>

              <p className="mt-8 text-lg text-gray-300 leading-8 line-clamp-5">
                {featured.overview}
              </p>

              <div className="flex gap-5 mt-10">

                <button className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200">
                  <FaPlay />
                  Watch Trailer
                </button>

                <button className="bg-white/20 backdrop-blur px-8 py-3 rounded-lg hover:bg-white/30">
                  More Details
                </button>

              </div>

            </div>

          </div>

        </section>
      )}

      <div className="sticky top-[72px] bg-[#0b0b0b]/90 backdrop-blur z-40 border-b border-gray-800">

        <div className="max-w-7xl mx-auto p-5">

          <div className="relative">

            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Movies..."
              className="w-full bg-[#1a1a1a] rounded-xl pl-14 py-4 outline-none border border-gray-700 focus:border-red-500"
            />

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">

              {error ? (
        <div className="flex flex-col items-center justify-center py-32">

          <FaExclamationTriangle className="text-6xl text-red-500 mb-6" />

          <h2 className="text-3xl font-bold">
            Something went wrong
          </h2>

          <p className="text-gray-400 mt-3">
            Unable to load movies from TMDB.
          </p>

          <button
            onClick={loadMovies}
            className="mt-8 bg-red-600 px-8 py-3 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>

        </div>

      ) : search.trim() ? (

        <>
          <div className="flex items-center gap-3 mb-8">

            <FaFire className="text-red-500 text-2xl" />

            <h2 className="text-3xl font-bold">
              Search Results
            </h2>

            <span className="text-gray-500">
              "{search}"
            </span>

          </div>

          {searchLoading ? (

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">

              {[...Array(12)].map((_, index) => (

                <div
                  key={index}
                  className="animate-pulse bg-[#1c1c1c] rounded-xl h-[360px]"
                />

              ))}

            </div>

          ) : (

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">

              {searchResult.map((movie) => (

                <div
                  key={movie.id}
                  className="group rounded-xl overflow-hidden bg-[#181818] hover:scale-105 transition duration-300 cursor-pointer"
                >

                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "https://placehold.co/500x750/111/666?text=No+Poster"
                    }
                    alt={movie.title}
                    className="w-full h-[320px] object-cover"
                  />

                  <div className="p-4">

                    <h3 className="font-bold line-clamp-2 group-hover:text-red-400">
                      {movie.title}
                    </h3>

                    <div className="flex justify-between mt-3 text-sm text-gray-400">

                      <span>
                        {movie.release_date?.substring(0, 4)}
                      </span>

                      <span className="flex items-center gap-1">

                        <FaStar className="text-yellow-400" />

                        {movie.vote_average.toFixed(1)}

                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </>

      ) : loading ? (

        <div className="space-y-12">

          {[...Array(5)].map((_, index) => (

            <div key={index}>

              <div className="h-8 w-64 bg-[#222] rounded animate-pulse mb-5" />

              <div className="flex gap-5 overflow-hidden">

                {[...Array(6)].map((_, i) => (

                  <div
                    key={i}
                    className="min-w-[220px] h-[340px] rounded-xl bg-[#1a1a1a] animate-pulse"
                  />

                ))}

              </div>

            </div>

          ))}

        </div>

      ) : (

        <>

          {rows.map((row) => (

            <HorizontalRow
              key={row.title}
              title={row.title}
              shows={row.movies}
            />

          ))}

        </>

      )}

    </div>

  </div>
);

}

export default Home;