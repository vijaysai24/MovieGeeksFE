import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { libraryApi } from "../Services/userService";
import { errorMessage } from "../Services/api";
import { guestWishlist, useGuestWishlist } from "../Services/guestWishlist";

export const LIBRARY_KEYS = ["me", "keys"];

export const titleKey = (title) => `${title.mediaType}:${title.id}`;

// What the viewer has done with every title, fetched once, so any card can show "watched", a heart
// or the member's own score without a request of its own. Guests get their browser wishlist.
export function useLibraryKeys() {
  const { isMember } = useAuth();
  const guestItems = useGuestWishlist();
  const query = useQuery({
    queryKey: LIBRARY_KEYS,
    queryFn: libraryApi.keys,
    enabled: isMember,
    staleTime: 60 * 1000,
  });

  return useMemo(() => {
    if (!isMember) {
      return {
        wishlist: new Set(guestItems.map((item) => `${item.mediaType}:${item.id}`)),
        favorites: new Set(),
        statuses: {},
        ratings: {},
      };
    }
    const data = query.data;
    return {
      wishlist: new Set(data?.wishlist || []),
      favorites: new Set(data?.favorites || []),
      statuses: data?.statuses || {},
      ratings: data?.ratings || {},
    };
  }, [isMember, guestItems, query.data]);
}

// The heart on a card: instant for guests (browser storage) and optimistic for members.
export function useQuickWishlist() {
  const { isMember } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: ({ title, on }) => (on
      ? libraryApi.wishlist(title.mediaType, title.id)
      : libraryApi.unwishlist(title.mediaType, title.id)),
    onMutate: async ({ title, on }) => {
      await queryClient.cancelQueries({ queryKey: LIBRARY_KEYS });
      const previous = queryClient.getQueryData(LIBRARY_KEYS);
      queryClient.setQueryData(LIBRARY_KEYS, (current) => {
        if (!current) return current;
        const key = titleKey(title);
        const wishlist = on ? [...new Set([...current.wishlist, key])] : current.wishlist.filter((item) => item !== key);
        return { ...current, wishlist };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(LIBRARY_KEYS, context?.previous);
      toast.show(errorMessage(err, "That didn't save. Try again."), { tone: "error" });
    },
    onSuccess: (state, { title }) => {
      queryClient.setQueryData(["me", "state", title.mediaType, title.id], state);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS });
      queryClient.invalidateQueries({ queryKey: ["me", "library"] });
      queryClient.invalidateQueries({ queryKey: ["me", "counts"] });
    },
  });

  return (title, currentlyOn) => {
    if (isMember) {
      mutation.mutate({ title, on: !currentlyOn });
      toast.show(currentlyOn ? `Removed ${title.title} from your wishlist` : `${title.title} is on your wishlist`);
      return;
    }
    if (currentlyOn) {
      guestWishlist.remove(title.mediaType, title.id);
      toast.show("Removed from your wishlist");
    } else {
      guestWishlist.add(title);
      toast.show("Saved to this browser. Sign in to keep it everywhere.");
    }
  };
}
