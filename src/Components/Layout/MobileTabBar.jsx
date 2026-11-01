import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Bookmark, Compass, Home, Users, UserRound } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

// On phones the main destinations sit under the thumb. The bar steps aside while reading down
// the page and returns as soon as the reader scrolls back up, so it never sits over the text
// they are reading.
function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) > 8) {
        setHidden(delta > 0 && y > 120);
        lastY.current = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

function MobileTabBar() {
  const { user } = useAuth();
  const hidden = useHideOnScrollDown();

  const tabs = [
    { label: "Home", to: "/", icon: Home, end: true },
    { label: "Discover", to: "/discover", icon: Compass },
    { label: "Community", to: "/community", icon: Users },
    { label: "Library", to: "/watchlist", icon: Bookmark },
    { label: user ? "You" : "Sign in", to: user ? `/u/${user.username}` : "/login", icon: UserRound },
  ];

  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 bottom-0 z-40 bg-surface pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-[var(--ease-out-soft)] md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="grid grid-cols-5">
        {tabs.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) => `flex h-14 flex-col items-center justify-center gap-1 text-[11px] ${isActive ? "text-ink" : "text-faint"}`}
          >
            <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileTabBar;
