import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, Search, X } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useUnreadCount } from "../../Hooks/useUnreadCount";
import { SearchBox } from "./SearchBox";
import { Wordmark } from "./Wordmark";
import { Avatar } from "../UI/Avatar";
import { LinkButton } from "../UI/Button";

const LINKS = [
  { name: "Discover", path: "/discover" },
  { name: "In Cinemas", path: "/movies/theatrical" },
  { name: "Streaming", path: "/movies/ott" },
  { name: "Series", path: "/tvshows" },
  { name: "Community", path: "/community" },
];

// Pages that open on a full-bleed picture; the bar starts transparent over them.
export const HERO_ROUTES = /^\/($|movie\/|tv\/|person\/|u\/)/;

function useScrolledPast(threshold) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return past;
}

function AccountMenu() {
  const { user, isStaff, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = [
    [
      { label: "Your Profile", to: `/u/${user.username}` },
      { label: "Library", to: "/watchlist" },
      { label: "Diary", to: "/diary" },
      { label: "Lists", to: `/u/${user.username}?tab=lists` },
      { label: "Watch Parties", to: "/parties" },
    ],
    [
      { label: "Following Feed", to: "/feed" },
      { label: "Settings", to: "/settings" },
      ...(isStaff ? [{ label: "Moderation", to: "/moderation" }] : []),
    ],
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors can-hover:hover:bg-white/[0.08] sm:pr-3"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden max-w-28 truncate text-sm text-ink sm:block">{user.name.split(" ")[0]}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-panel bg-surface py-2 shadow-float ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-3 px-4 pb-3 pt-2">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-[13px] text-faint" translate="no">@{user.username}</p>
            </div>
          </div>
          {groups.map((items, index) => (
            <div key={index} className="border-t border-line py-1.5">
              {items.map((item) => (
                <Link key={item.to} role="menuitem" to={item.to} className="block px-4 py-2 text-sm text-muted transition-colors can-hover:hover:bg-raised can-hover:hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="border-t border-line pt-1.5">
            <button type="button" role="menuitem" onClick={signOut} className="block w-full px-4 py-2 text-left text-sm text-muted transition-colors can-hover:hover:bg-raised can-hover:hover:text-ink">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationsLink() {
  const { data } = useUnreadCount();
  const unread = data?.unread || 0;
  return (
    <Link
      to="/notifications"
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors can-hover:hover:bg-white/[0.08] can-hover:hover:text-ink"
    >
      <Bell size={19} aria-hidden="true" />
      {unread > 0 && (
        <span className="num absolute right-0.5 top-0.5 min-w-[18px] rounded-full bg-[#dc3532] px-1 text-center text-[11px] font-semibold leading-[18px] text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

function NavBar() {
  const { status, isMember } = useAuth();
  const [mobileSearch, setMobileSearch] = useState(false);
  const location = useLocation();
  const overHero = HERO_ROUTES.test(location.pathname);
  const scrolled = useScrolledPast(24);
  const solid = !overHero || scrolled;

  useEffect(() => setMobileSearch(false), [location.pathname]);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color] duration-300 ${solid ? "bg-ground" : "scrim-top bg-transparent"}`}>
      <div className="page flex h-14 items-center gap-3 md:h-16 lg:gap-6">
        <Wordmark />

        <nav aria-label="Main" className="hidden items-center lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `rounded-full px-3.5 py-2 text-[15px] transition-colors ${isActive ? "text-ink" : "text-muted can-hover:hover:text-ink"}`}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <SearchBox className="ml-auto hidden w-full max-w-[360px] md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearch(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors can-hover:hover:bg-white/[0.08] can-hover:hover:text-ink md:hidden"
          >
            <Search size={19} aria-hidden="true" />
          </button>

          {status === "loading" && <span className="h-9 w-24" aria-hidden="true" />}

          {status === "guest" && (
            <>
              <Link to="/login" state={{ from: location }} className="hidden rounded-full px-3.5 py-2 text-[15px] text-muted transition-colors can-hover:hover:text-ink sm:block">
                Sign In
              </Link>
              <LinkButton to="/register" variant="primary" size="sm">Join Free</LinkButton>
            </>
          )}

          {isMember && (
            <>
              <NotificationsLink />
              <AccountMenu />
            </>
          )}
        </div>
      </div>

      {mobileSearch && (
        <div className="fixed inset-0 z-50 overscroll-contain bg-ground px-4 pt-3 md:hidden">
          <div className="flex items-center gap-2">
            <SearchBox autoFocus className="flex-1" onNavigate={() => setMobileSearch(false)} />
            <button type="button" aria-label="Close search" onClick={() => setMobileSearch(false)} className="rounded-full p-2.5 text-muted can-hover:hover:text-ink">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavBar;
