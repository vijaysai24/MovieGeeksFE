import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { refreshSession, setAccessToken, setSessionEndHandler } from "../Services/api";
import { authApi, libraryApi } from "../Services/userService";
import { guestWishlist } from "../Services/guestWishlist";

const AuthContext = createContext(null);

// Whatever a guest saved before signing in comes with them.
const mergeGuestWishlist = async () => {
  const items = guestWishlist.refs();
  if (!items.length) return null;
  try {
    const result = await libraryApi.syncWishlist(items);
    guestWishlist.clear();
    return result;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  const startSession = useCallback(async (session) => {
    setAccessToken(session.token);
    setUser(session.user);
    setStatus("member");
    const merged = await mergeGuestWishlist();
    queryClient.invalidateQueries();
    return { user: session.user, merged };
  }, [queryClient]);

  useEffect(() => {
    setSessionEndHandler(() => {
      setUser(null);
      setStatus("guest");
      queryClient.removeQueries({ queryKey: ["me"] });
    });

    refreshSession()
      .then((session) => {
        setUser(session.user);
        setStatus("member");
      })
      .catch(() => setStatus("guest"));
  }, [queryClient]);

  const signIn = useCallback(
    async (email, password) => startSession(await authApi.login({ email, password })),
    [startSession]
  );

  const register = useCallback(
    async (body) => startSession(await authApi.register(body)),
    [startSession]
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("guest");
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(() => ({
    user,
    status,
    isMember: status === "member",
    isStaff: user?.role === "MODERATOR" || user?.role === "ADMIN",
    signIn,
    register,
    signOut,
    setUser,
    startSession,
  }), [user, status, signIn, register, signOut, startSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
