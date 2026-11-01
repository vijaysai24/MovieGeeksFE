import { useSyncExternalStore } from "react";

// A guest's wishlist lives in this browser until they sign in, when it is merged into the account.
const KEY = "mg:guest-wishlist";
const EVENT = "mg:guest-wishlist";
const LIMIT = 100;

let cache = null;

const read = () => {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
};

const write = (items) => {
  cache = items.slice(0, LIMIT);
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Private windows can refuse storage; the list still works for this visit.
  }
  window.dispatchEvent(new Event(EVENT));
};

const subscribe = (callback) => {
  const onStorage = (event) => {
    if (event.key === KEY) {
      cache = null;
      callback();
    }
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
};

const keyOf = (item) => `${item.mediaType}:${item.id ?? item.tmdbId}`;

export const guestWishlist = {
  items: read,
  has: (mediaType, id) => read().some((item) => item.mediaType === mediaType && item.id === id),
  add: (title) => {
    if (guestWishlist.has(title.mediaType, title.id)) return;
    write([
      {
        id: title.id,
        mediaType: title.mediaType,
        title: title.title,
        posterPath: title.posterPath || null,
        backdropPath: title.backdropPath || null,
        year: title.year || null,
        releaseDate: title.releaseDate || null,
        rating: title.rating ?? null,
        addedAt: new Date().toISOString(),
      },
      ...read(),
    ]);
  },
  remove: (mediaType, id) => write(read().filter((item) => keyOf(item) !== `${mediaType}:${id}`)),
  clear: () => write([]),
  refs: () => read().map((item) => ({ mediaType: item.mediaType, tmdbId: item.id })),
};

export const useGuestWishlist = () => useSyncExternalStore(subscribe, read, () => []);
