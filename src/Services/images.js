import { API_ORIGIN } from "./api";

const TMDB_IMAGES = "https://image.tmdb.org/t/p";

export const tmdbImage = (path, size = "w500") => (path ? `${TMDB_IMAGES}/${size}${path}` : null);

export const posterSrcSet = (path) => (path
  ? ["w185", "w342", "w500", "w780"].map((size) => `${TMDB_IMAGES}/${size}${path} ${size.slice(1)}w`).join(", ")
  : undefined);

export const backdropSrcSet = (path) => (path
  ? [["w780", 780], ["w1280", 1280], ["original", 2400]].map(([size, width]) => `${TMDB_IMAGES}/${size}${path} ${width}w`).join(", ")
  : undefined);

export const profileImage = (path, size = "w185") => tmdbImage(path, size);

// Avatars are uploaded to our API and stored as /uploads/... paths.
export const avatarSrc = (url) => {
  if (!url) return null;
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
};

export const titleHref = (item) => `/${item.mediaType}/${item.id}`;
