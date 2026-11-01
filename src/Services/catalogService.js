import api, { unwrap } from "./api";

// Arrays travel as comma-separated ids; empty filters are left off so cache keys stay stable.
const toParams = (params = {}) => Object.fromEntries(
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && !value.length))
    .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value])
);

export const catalogApi = {
  home: (region) => unwrap(api.get("/catalog/home", { params: toParams({ region }) })),
  list: (list, params) => unwrap(api.get(`/catalog/lists/${list}`, { params: toParams(params) })),
  discover: (params) => unwrap(api.get("/catalog/discover", { params: toParams(params) })),
  random: (params) => unwrap(api.get("/catalog/random", { params: toParams(params) })),
  search: (params) => unwrap(api.get("/catalog/search", { params: toParams(params) })),
  autocomplete: (q) => unwrap(api.get("/catalog/autocomplete", { params: { q } })),
  details: (mediaType, id, region) => unwrap(api.get(`/catalog/${mediaType}/${id}`, { params: toParams({ region }) })),
  person: (id) => unwrap(api.get(`/catalog/person/${id}`)),
  genres: () => unwrap(api.get("/catalog/genres")),
  languages: () => unwrap(api.get("/catalog/languages")),
  regions: () => unwrap(api.get("/catalog/regions")),
  providers: (params) => unwrap(api.get("/catalog/providers", { params: toParams(params) })),
  calendar: (params) => unwrap(api.get("/catalog/calendar", { params: toParams(params) })),
};
