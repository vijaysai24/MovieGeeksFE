import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../Services/catalogService";

const DAY = 24 * 3600 * 1000;

// Reference lists change rarely; fetch once per session.
export const useGenres = () => useQuery({ queryKey: ["catalog", "genres"], queryFn: catalogApi.genres, staleTime: DAY, gcTime: DAY });

export const useLanguages = () => useQuery({ queryKey: ["catalog", "languages"], queryFn: catalogApi.languages, staleTime: DAY, gcTime: DAY });

export const useRegions = () => useQuery({ queryKey: ["catalog", "regions"], queryFn: catalogApi.regions, staleTime: DAY, gcTime: DAY });

export const useProviders = (mediaType, region) => useQuery({
  queryKey: ["catalog", "providers", mediaType, region],
  queryFn: () => catalogApi.providers({ mediaType, region }),
  staleTime: DAY,
});

export const genreNames = (genreIds = [], genres = []) => {
  const byId = new Map(genres.map((genre) => [genre.id, genre.name]));
  return genreIds.map((id) => byId.get(id)).filter(Boolean);
};

// The handful of languages most people browse in India and beyond, ahead of the full list.
export const COMMON_LANGUAGES = ["en", "hi", "te", "ta", "ml", "kn", "bn", "mr", "ko", "ja", "es", "fr"];
