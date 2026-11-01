import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = new URL(API_URL).origin;

// The access token lives only in memory; the refresh token is an httpOnly cookie the browser
// sends to /auth/refresh by itself.
let accessToken = null;
let onSessionEnd = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setSessionEndHandler = (handler) => {
  onSessionEnd = handler;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Every caller that needs a fresh token shares one refresh. If another tab refreshed a moment
// earlier the server answers REFRESH_RACE, and the cookie that tab received is already ours.
let refreshing = null;

export const refreshSession = () => {
  if (!refreshing) {
    refreshing = (async () => {
      for (let attempt = 0; ; attempt++) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, null, {
            withCredentials: true,
            timeout: 10000,
          });
          setAccessToken(data.data.token);
          return data.data;
        } catch (err) {
          if (err.response?.data?.code === "REFRESH_RACE" && attempt === 0) {
            await wait(400);
            continue;
          }
          throw err;
        }
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const code = error.response?.data?.code;

    if (error.response?.status === 401 && code === "TOKEN_EXPIRED" && original && !original._retried) {
      original._retried = true;
      try {
        await refreshSession();
        return api(original);
      } catch (refreshError) {
        setAccessToken(null);
        onSessionEnd();
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export const unwrap = (request) => request.then((response) => response.data.data);

export const errorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  const data = err?.response?.data;
  if (data?.errors?.length) return data.errors[0].msg;
  if (data?.message) return data.message;
  if (err?.code === "ECONNABORTED" || err?.message === "Network Error") {
    return "Can't reach Movie Geeks right now. Check your connection.";
  }
  return fallback;
};

export const errorCode = (err) => err?.response?.data?.code || null;

export default api;
