import { NavLink } from "react-router-dom";
import { Bell, Bookmark, NotebookPen, Rss, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useUnreadCount } from "../../Hooks/useUnreadCount";

// The member's own area: a labelled sidebar on the page ground, divided from the canvas by one
// rule. The active item is marked by its label brightening, nothing else.
export function AccountShell({ title, subtitle, actions, children }) {
  const { user, isStaff } = useAuth();
  const { data: unread } = useUnreadCount();

  const items = [
    { label: "Library", to: "/watchlist", icon: Bookmark },
    ...(user
      ? [
        { label: "Diary", to: "/diary", icon: NotebookPen },
        { label: "Following feed", to: "/feed", icon: Rss },
        { label: "Notifications", to: "/notifications", icon: Bell, count: unread?.unread || 0 },
        { label: "Your profile", to: `/u/${user.username}`, icon: UserRound },
        { label: "Settings", to: "/settings", icon: Settings },
      ]
      : []),
    ...(isStaff ? [{ label: "Moderation", to: "/moderation", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[224px_1fr]">
      <aside className="hidden border-r border-line lg:block">
        <nav aria-label="Your area" className="sticky top-16 px-3 py-7">
          {user && <p className="mb-3 truncate px-3 text-[13px] text-faint">@{user.username}</p>}
          <ul className="space-y-0.5">
            {items.map(({ label, to, icon: Icon, count }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) => `flex h-[34px] items-center gap-2.5 rounded-lg px-3 text-sm transition-colors ${isActive ? "bg-raised text-ink" : "text-[#bbbbbb] hover:text-ink"}`}
                >
                  <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {count > 0 && <span className="num text-[12px] text-ink">{count}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 px-4 pb-12 pt-6 md:px-[29px] lg:pt-7">
        <nav aria-label="Your area" className="hide-scrollbar -mx-4 mb-6 flex gap-1 overflow-x-auto px-4 lg:hidden">
          {items.map(({ label, to, count }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `flex h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-sm ${isActive ? "bg-raised text-ink" : "text-muted"}`}
            >
              {label}
              {count > 0 && <span className="num text-[12px] text-ink">{count}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="num mt-1 text-[15px] text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
