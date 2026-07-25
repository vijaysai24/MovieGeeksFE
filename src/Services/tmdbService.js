import api from "./interceptor";

export const getTrendingTV = () => api.get("/trending/tv/week");

export const getPopularTV = () => api.get("/tv/popular");

export const getTopRatedTV = () => api.get("/tv/top_rated");

export const getOnAirTV = () => api.get("/tv/on_the_air");

export const getAiringTodayTV = () => api.get("/tv/airing_today");

export const getTVByGenre = (genreId) =>
  api.get("/discover/tv", {
    params: {
      with_genres: genreId,
      sort_by: "popularity.desc",
    },
  });

export const searchTV = (query) =>
  api.get("/search/tv", {
    params: {
      query,
    },
  });

export const getTVDetails = (id) =>
  api.get(`/tv/${id}`);