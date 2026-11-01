import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../Context/AuthContext";
import { socialApi } from "../Services/userService";

// Polled once a minute while signed in; marking notifications read updates it straight away.
export function useUnreadCount() {
  const { isMember } = useAuth();
  return useQuery({
    queryKey: ["me", "notifications", "unread"],
    queryFn: socialApi.unreadCount,
    enabled: isMember,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}
