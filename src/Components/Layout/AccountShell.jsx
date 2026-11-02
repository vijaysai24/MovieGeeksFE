import { NavLink, useLocation } from "react-router-dom";
import { Bell, Bookmark, ListVideo, NotebookPen, PartyPopper, Rss, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useUnreadCount } from "../../Hooks/useUnreadCount";

// The member's own area: a quiet sidebar beside the canvas on wide screens, a row of pills above
// it on small ones. The active item is the only one with a fill.
export function AccountShell({ title, subtitle, actions, children }) {
  const { user, isStaff } = useAuth();
  const { data: unread } = useUnreadCount();
  const location = useLocation();

  const items = [
    { label: "Library", to: "/watchlist", icon: Bookmark },
    ...(user
      ? [
        { label: "Diary", to: "/diary", icon: NotebookPen },
        { label: "Lists", to: `/u/${user.username}?tab=lists`, icon: ListVideo },
        { label: "Watch Parties", to: "/parties", icon: PartyPopper },
        { label: "Following Feed", to: "/feed", icon: Rss },
        { label: "Notifications", to: "/notifications", icon: Bell, count: unread?.unread || 0 },
        { label: "Your Profile", to: `/u/${user.username}`, icon: UserRound },
        { label: "Settings", to: "/settings", icon: Settings },
      ]
      : []),
    ...(isStaff ? [{ label: "Moderation", to: "/moderation", icon: ShieldCheck }] : []),
  ];
  // Profile tabs share a path, so "Lists" and "Your Profile" are told apart by the query string.
  const isActive = (to) => {
    const [path, search] = to.split("?");
    return location.pathname === path && (search ? location.search === `?${search}` : !location.search.includes("tab=lists"));
  };

  return (
    <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line lg:block">
        <nav aria-label="Your area" className="sticky top-16 px-4 py-10">
          {user && <p className="mb-4 truncate px-3 text-[13px] text-faint">@{user.username}</p>}
          <ul className="space-y-0.5">
            {items.map(({ label, to, icon: Icon, count }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  aria-current={isActive(to) ? "page" : undefined}
                  className={`flex h-10 items-center gap-3 rounded-control px-3 text-[15px] transition-colors ${isActive(to) ? "bg-raised font-medium text-ink" : "text-muted can-hover:hover:text-ink"}`}
                >
                  <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {count > 0 && <span className="num rounded-full bg-accent px-1.5 text-[12px] font-semibold text-accent-ink">{count}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 px-4 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <nav aria-label="Your area" className="hide-scrollbar -mx-4 mb-8 flex gap-1.5 overflow-x-auto px-4 sm:-mx-8 sm:px-8 lg:hidden">
          {items.map(({ label, to, count }) => (
            <NavLink
              key={to}
              to={to}
              aria-current={isActive(to) ? "page" : undefined}
              className={`flex h-9 flex-none items-center gap-1.5 rounded-full px-4 text-[14px] ${isActive(to) ? "bg-ink font-medium text-ground" : "bg-surface text-muted"}`}
            >
              {label}
              {count > 0 && <span className="num text-[12px] text-accent">{count}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="display text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] leading-[1.02] text-ink">{title}</h1>
            {subtitle && <p className="num mt-2 text-ui text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
