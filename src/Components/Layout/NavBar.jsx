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
  { name: "In cinemas", path: "/movies/theatrical" },
  { name: "Streaming", path: "/movies/ott" },
  { name: "Series", path: "/tvshows" },
  { name: "Community", path: "/community" },
];

const linkClass = ({ isActive }) => `px-3 py-2 text-sm transition-colors ${isActive ? "text-ink" : "text-muted hover:text-ink"}`;

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

  const items = [
    { label: "Your profile", to: `/u/${user.username}` },
    { label: "Library", to: "/watchlist" },
    { label: "Diary", to: "/diary" },
    { label: "Following feed", to: "/feed" },
    { label: "Settings", to: "/settings" },
    ...(isStaff ? [{ label: "Moderation", to: "/moderation" }] : []),
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-white/[0.06]"
      >
        <Avatar user={user} size="sm" />
        <span className="max-w-28 truncate text-sm text-ink">{user.name.split(" ")[0]}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl bg-surface py-2 shadow-[0_20px_48px_rgba(0,0,0,0.65)]">
          <p className="truncate px-4 pb-2 pt-1 text-[13px] text-faint">@{user.username}</p>
          {items.map((item) => (
            <Link key={item.to} role="menuitem" to={item.to} className="block px-4 py-2 text-sm text-muted hover:bg-raised hover:text-ink">
              {item.label}
            </Link>
          ))}
          <button type="button" role="menuitem" onClick={signOut} className="block w-full px-4 py-2 text-left text-sm text-muted hover:bg-raised hover:text-ink">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function NotificationsLink({ className = "" }) {
  const { data } = useUnreadCount();
  const unread = data?.unread || 0;
  return (
    <Link
      to="/notifications"
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.08] hover:text-ink ${className}`}
    >
      <Bell size={18} />
      {unread > 0 && (
        <span className="num absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-[#dc3532] px-1 text-center text-[11px] font-semibold leading-[18px] text-white">
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

  useEffect(() => setMobileSearch(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-ground">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 md:h-16 md:px-6 lg:px-8">
        <Wordmark />

        <nav aria-label="Main" className="ml-2 hidden items-center lg:flex">
          {LINKS.map((link) => (
            <NavLink key={link.path} to={link.path} className={linkClass}>
              {link.name}
            </NavLink>
          ))}
        </nav>

        <SearchBox className="ml-auto hidden w-full max-w-sm md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearch(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-white/[0.08] hover:text-ink md:hidden"
          >
            <Search size={18} />
          </button>

          {status === "loading" && <span className="h-8 w-24" aria-hidden="true" />}

          {status === "guest" && (
            <>
              <Link to="/login" state={{ from: location }} className="hidden px-3 py-2 text-sm text-muted hover:text-ink sm:block">
                Sign in
              </Link>
              <LinkButton to="/register" variant="primary" size="sm">Join</LinkButton>
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
        <div className="fixed inset-0 z-50 bg-ground px-4 pt-3 md:hidden">
          <div className="flex items-center gap-2">
            <SearchBox autoFocus className="flex-1" onNavigate={() => setMobileSearch(false)} />
            <button type="button" aria-label="Close search" onClick={() => setMobileSearch(false)} className="rounded-full p-2 text-muted hover:text-ink">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavBar;
