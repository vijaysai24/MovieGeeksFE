import api, { unwrap } from "./api";

const titlePath = (mediaType, tmdbId) => `/titles/${mediaType}/${tmdbId}`;

export const authApi = {
  register: (body) => unwrap(api.post("/auth/register", body)),
  login: (body) => unwrap(api.post("/auth/login", body)),
  logout: () => api.post("/auth/logout"),
  me: () => unwrap(api.get("/auth/me")),
  changePassword: (body) => unwrap(api.put("/auth/password", body)),
};

export const profileApi = {
  update: (changes) => unwrap(api.patch("/me/profile", changes)),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append("avatar", file);
    return unwrap(api.post("/me/avatar", form));
  },
  removeAvatar: () => unwrap(api.delete("/me/avatar")),
};

export const libraryApi = {
  state: (mediaType, tmdbId) => unwrap(api.get(`/me${titlePath(mediaType, tmdbId)}/state`)),
  setStatus: (mediaType, tmdbId, status) => unwrap(api.put(`/me${titlePath(mediaType, tmdbId)}/status`, { status })),
  clearStatus: (mediaType, tmdbId) => unwrap(api.delete(`/me${titlePath(mediaType, tmdbId)}/status`)),
  rate: (mediaType, tmdbId, rating) => unwrap(api.put(`/me${titlePath(mediaType, tmdbId)}/rating`, { rating })),
  unrate: (mediaType, tmdbId) => unwrap(api.delete(`/me${titlePath(mediaType, tmdbId)}/rating`)),
  wishlist: (mediaType, tmdbId) => unwrap(api.put(`/me${titlePath(mediaType, tmdbId)}/wishlist`)),
  unwishlist: (mediaType, tmdbId) => unwrap(api.delete(`/me${titlePath(mediaType, tmdbId)}/wishlist`)),
  favorite: (mediaType, tmdbId) => unwrap(api.put(`/me${titlePath(mediaType, tmdbId)}/favorite`)),
  unfavorite: (mediaType, tmdbId) => unwrap(api.delete(`/me${titlePath(mediaType, tmdbId)}/favorite`)),
  syncWishlist: (items) => unwrap(api.post("/me/wishlist/sync", { items })),
  library: (params) => unwrap(api.get("/me/library", { params })),
  counts: () => unwrap(api.get("/me/library/counts")),
  wishlistItems: (params) => unwrap(api.get("/me/wishlist", { params })),
  favorites: (params) => unwrap(api.get("/me/favorites", { params })),
  ratings: (params) => unwrap(api.get("/me/ratings", { params })),
  diary: (params) => unwrap(api.get("/me/diary", { params })),
  diaryYears: () => unwrap(api.get("/me/diary/years")),
  logWatch: (body) => unwrap(api.post("/me/diary", body)),
  updateDiary: (id, changes) => unwrap(api.patch(`/me/diary/${id}`, changes)),
  deleteDiary: (id) => unwrap(api.delete(`/me/diary/${id}`)),
  topFive: () => unwrap(api.get("/me/top-five")),
  setTopFive: (items) => unwrap(api.put("/me/top-five", { items })),
};

export const reviewApi = {
  forTitle: (mediaType, tmdbId, params) => unwrap(api.get(`${titlePath(mediaType, tmdbId)}/reviews`, { params })),
  save: (mediaType, tmdbId, body) => unwrap(api.put(`${titlePath(mediaType, tmdbId)}/review`, body)),
  remove: (mediaType, tmdbId) => unwrap(api.delete(`${titlePath(mediaType, tmdbId)}/review`)),
  community: (mediaType, tmdbId) => unwrap(api.get(`${titlePath(mediaType, tmdbId)}/community`)),
  get: (id) => unwrap(api.get(`/reviews/${id}`)),
  react: (id, reaction) => unwrap(api.put(`/reviews/${id}/reaction`, { reaction })),
  unreact: (id) => unwrap(api.delete(`/reviews/${id}/reaction`)),
  comments: (id, params) => unwrap(api.get(`/reviews/${id}/comments`, { params })),
  comment: (id, body) => unwrap(api.post(`/reviews/${id}/comments`, { body })),
  deleteComment: (id) => unwrap(api.delete(`/comments/${id}`)),
  popular: (params) => unwrap(api.get("/reviews/popular", { params })),
};

export const socialApi = {
  profile: (username) => unwrap(api.get(`/users/${username}`)),
  profileList: (username, list, params) => unwrap(api.get(`/users/${username}/${list}`, { params })),
  follow: (username) => unwrap(api.put(`/users/${username}/follow`)),
  unfollow: (username) => unwrap(api.delete(`/users/${username}/follow`)),
  searchUsers: (q) => unwrap(api.get("/users/search", { params: { q } })),
  feed: (params) => unwrap(api.get("/me/feed", { params })),
  notifications: (params) => unwrap(api.get("/me/notifications", { params })),
  unreadCount: () => unwrap(api.get("/me/notifications/unread-count")),
  markRead: (ids) => unwrap(api.post("/me/notifications/read", ids ? { ids } : {})),
  trending: (params) => unwrap(api.get("/community/trending", { params })),
  members: () => unwrap(api.get("/community/members")),
  report: (body) => unwrap(api.post("/reports", body)),
};

export const moderationApi = {
  reports: (params) => unwrap(api.get("/moderation/reports", { params })),
  details: (targetType, targetId) => unwrap(api.get(`/moderation/reports/${targetType}/${targetId}`)),
  act: (body) => unwrap(api.post("/moderation/actions", body)),
  setUserStatus: (username, status) => unwrap(api.patch(`/moderation/users/${username}`, { status })),
};
