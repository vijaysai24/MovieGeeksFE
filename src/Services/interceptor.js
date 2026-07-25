import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL,
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = import.meta.env.VITE_TMDB_TOKEN;

    config.headers.Authorization = `Bearer ${token}`;
    config.headers.Accept = "application/json";

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("TMDB API Error:", error.response?.data || error.message);

    return Promise.reject(error);
  }
);

export default api;