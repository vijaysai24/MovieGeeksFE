import api from "./interceptor";

// Trending Movies
export const getTrendingMovies = () =>
  api.get("/trending/movie/week");

// Now Playing
export const getNowPlayingMovies = () =>
  api.get("/movie/now_playing");

// Popular Movies
export const getPopularMovies = () =>
  api.get("/movie/popular");

// Top Rated Movies
export const getTopRatedMovies = () =>
  api.get("/movie/top_rated");

// Upcoming Movies
export const getUpcomingMovies = () =>
  api.get("/movie/upcoming");

// Movies By Genre
export const getMoviesByGenre = (genreId) =>
  api.get("/discover/movie", {
    params: {
      with_genres: genreId,
      sort_by: "popularity.desc",
    },
  });

// Search Movies
export const searchMovies = (query) =>
  api.get("/search/movie", {
    params: {
      query,
      include_adult: false,
    },
  });

// Movie Details
export const getMovieDetails = (movieId) =>
  api.get(`/movie/${movieId}`);

// Similar Movies
export const getSimilarMovies = (movieId) =>
  api.get(`/movie/${movieId}/similar`);

// Recommendations
export const getRecommendations = (movieId) =>
  api.get(`/movie/${movieId}/recommendations`);

// Movie Credits (Cast & Crew)
export const getMovieCredits = (movieId) =>
  api.get(`/movie/${movieId}/credits`);

// Videos (Trailer, Teaser, etc.)
export const getMovieVideos = (movieId) =>
  api.get(`/movie/${movieId}/videos`);

// Watch Providers
export const getWatchProviders = (movieId) =>
  api.get(`/movie/${movieId}/watch/providers`);



// Provider IDs
const NETFLIX = 8;
const PRIME = 9;
const DISNEY = 337;
const APPLE = 350;
const HOTSTAR = 122;

export const getNetflixMovies = () =>
  api.get("/discover/movie", {
    params: {
      with_watch_providers: NETFLIX,
      watch_region: "IN",
      sort_by: "popularity.desc",
    },
  });

export const getPrimeMovies = () =>
  api.get("/discover/movie", {
    params: {
      with_watch_providers: PRIME,
      watch_region: "IN",
      sort_by: "popularity.desc",
    },
  });

export const getDisneyMovies = () =>
  api.get("/discover/movie", {
    params: {
      with_watch_providers: DISNEY,
      watch_region: "IN",
      sort_by: "popularity.desc",
    },
  });

export const getAppleMovies = () =>
  api.get("/discover/movie", {
    params: {
      with_watch_providers: APPLE,
      watch_region: "IN",
      sort_by: "popularity.desc",
    },
  });

export const getHotstarMovies = () =>
  api.get("/discover/movie", {
    params: {
      with_watch_providers: HOTSTAR,
      watch_region: "IN",
      sort_by: "popularity.desc",
    },
  });