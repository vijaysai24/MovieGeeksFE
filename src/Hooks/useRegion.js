import { useCallback, useSyncExternalStore } from "react";
import { useAuth } from "../Context/AuthContext";
import { profileApi } from "../Services/userService";

const KEY = "cf:region";
const EVENT = "cf:region";
const DEFAULT_REGION = "IN";

const readGuestRegion = () => {
  try {
    return localStorage.getItem(KEY) || DEFAULT_REGION;
  } catch {
    return DEFAULT_REGION;
  }
};

const subscribe = (callback) => {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
};

// Availability, release dates and streaming services all depend on the country. Members keep it
// on their account; guests keep it in this browser.
export function useRegion() {
  const { user, setUser } = useAuth();
  const guestRegion = useSyncExternalStore(subscribe, readGuestRegion, () => DEFAULT_REGION);
  const region = user?.region || guestRegion;

  const setRegion = useCallback(async (code) => {
    try {
      localStorage.setItem(KEY, code);
    } catch {
      // Storage may be unavailable; members still save it below.
    }
    window.dispatchEvent(new Event(EVENT));
    if (user) {
      setUser(await profileApi.update({ region: code }));
    }
  }, [user, setUser]);

  return { region, setRegion };
}

const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

export const regionName = (code) => {
  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
};
