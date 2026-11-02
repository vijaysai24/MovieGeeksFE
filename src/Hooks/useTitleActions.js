import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { libraryApi } from "../Services/userService";
import { guestWishlist, useGuestWishlist } from "../Services/guestWishlist";
import { errorMessage } from "../Services/api";

export const EMPTY_STATE = {
  status: null,
  rating: null,
  wishlisted: false,
  favorite: false,
  topFivePosition: null,
  diaryCount: 0,
  lastWatchedOn: null,
  reviewId: null,
  alerts: [],
};

export const STATUS_LABELS = {
  PLAN_TO_WATCH: "Plan to Watch",
  WATCHING: "Watching",
  WATCHED: "Watched",
};

const ACTIONS = {
  setStatus: (title, status) => libraryApi.setStatus(title.mediaType, title.id, status),
  clearStatus: (title) => libraryApi.clearStatus(title.mediaType, title.id),
  rate: (title, rating) => libraryApi.rate(title.mediaType, title.id, rating),
  unrate: (title) => libraryApi.unrate(title.mediaType, title.id),
  wishlist: (title) => libraryApi.wishlist(title.mediaType, title.id),
  unwishlist: (title) => libraryApi.unwishlist(title.mediaType, title.id),
  favorite: (title) => libraryApi.favorite(title.mediaType, title.id),
  unfavorite: (title) => libraryApi.unfavorite(title.mediaType, title.id),
};

// What the server will answer, applied straight away so controls respond instantly.
const predict = (state, action, value) => {
  switch (action) {
    case "setStatus":
      return { ...state, status: value, wishlisted: value === "WATCHED" ? false : state.wishlisted };
    case "clearStatus":
      return { ...state, status: null };
    case "rate":
      return { ...state, rating: value, status: state.status === "WATCHING" ? "WATCHING" : "WATCHED", wishlisted: false };
    case "unrate":
      return { ...state, rating: null };
    case "wishlist":
      return { ...state, wishlisted: true };
    case "unwishlist":
      return { ...state, wishlisted: false };
    case "favorite":
      return { ...state, favorite: true, status: state.status === "WATCHING" ? "WATCHING" : "WATCHED", wishlisted: false };
    case "unfavorite":
      return { ...state, favorite: false };
    default:
      return state;
  }
};

export const titleStateKey = (mediaType, id) => ["me", "state", mediaType, id];

export function useTitleActions(title) {
  const { isMember, status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const guestItems = useGuestWishlist();

  const key = titleStateKey(title?.mediaType, title?.id);

  const stateQuery = useQuery({
    queryKey: key,
    queryFn: () => libraryApi.state(title.mediaType, title.id),
    enabled: isMember && Boolean(title?.id),
    staleTime: 30 * 1000,
  });

  const mutation = useMutation({
    mutationFn: ({ action, value }) => ACTIONS[action](title, value),
    onMutate: async ({ action, value }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key) || EMPTY_STATE;
      queryClient.setQueryData(key, predict(previous, action, value));
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(key, context?.previous);
      toast.show(errorMessage(err, "That didn't save. Try again."), { tone: "error" });
    },
    onSuccess: (state) => queryClient.setQueryData(key, state),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "library"] });
      queryClient.invalidateQueries({ queryKey: ["me", "counts"] });
      queryClient.invalidateQueries({ queryKey: ["me", "keys"] });
      queryClient.invalidateQueries({ queryKey: ["community", title.mediaType, title.id] });
    },
  });

  const run = (action, value) => mutation.mutate({ action, value });

  const requireMember = (reason = "Sign in to rate, review and keep a diary") => {
    toast.show(reason);
    navigate("/login", { state: { from: location } });
  };

  const guestWishlisted = guestItems.some((item) => item.mediaType === title?.mediaType && item.id === title?.id);
  const state = isMember ? stateQuery.data || EMPTY_STATE : { ...EMPTY_STATE, wishlisted: guestWishlisted };

  const toggleWishlist = () => {
    if (isMember) {
      run(state.wishlisted ? "unwishlist" : "wishlist");
      return;
    }
    if (guestWishlisted) {
      guestWishlist.remove(title.mediaType, title.id);
      toast.show("Removed from your wishlist");
    } else {
      guestWishlist.add(title);
      toast.show("Saved to this browser. Sign in to keep it everywhere.");
    }
  };

  const memberOnly = (fn) => (...args) => (isMember ? fn(...args) : requireMember());

  return {
    state,
    isMember,
    authLoading: authStatus === "loading",
    loading: isMember && stateQuery.isLoading,
    saving: mutation.isPending,
    toggleWishlist,
    setStatus: memberOnly((status) => (status === state.status ? run("clearStatus") : run("setStatus", status))),
    rate: memberOnly((rating) => (rating === state.rating ? run("unrate") : run("rate", rating))),
    toggleFavorite: memberOnly(() => run(state.favorite ? "unfavorite" : "favorite")),
    requireMember,
    refresh: () => queryClient.invalidateQueries({ queryKey: key }),
  };
}
