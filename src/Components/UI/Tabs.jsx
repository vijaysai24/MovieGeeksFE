import { NavLink } from "react-router-dom";

// Underline tabs; the indicator is as wide as the label. With phoneGrid, a long set becomes a grid of
// pills on phones instead of a row that runs off the screen.
export function Tabs({ tabs, value, onChange, label, className = "", phoneGrid = false }) {
  return (
    <div className={`${phoneGrid ? "" : "hide-scrollbar overflow-x-auto"} ${className}`}>
      <div role="tablist" aria-label={label} className={phoneGrid ? "grid grid-cols-3 gap-2 md:flex md:gap-6" : "flex min-w-max gap-6"}>
        {tabs.map((tab) => {
          const active = tab.value === value;
          const pill = phoneGrid
            ? `max-md:h-10 max-md:justify-center max-md:rounded-full max-md:px-2 max-md:text-[14px] ${active ? "max-md:bg-ink max-md:text-ground" : "max-md:bg-surface"}`
            : "";
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.value)}
              className={`relative flex h-12 items-center gap-2 text-[15px] transition-colors ${pill} ${
                active ? "font-medium text-ink" : "text-muted can-hover:hover:text-ink"
              }`}
            >
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && <span className="num text-faint">{tab.count}</span>}
              {active && <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-ink ${phoneGrid ? "max-md:hidden" : ""}`} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LinkTabs({ tabs, label, className = "" }) {
  return (
    <nav aria-label={label} className={`hide-scrollbar overflow-x-auto ${className}`}>
      <div className="flex min-w-max gap-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `relative -mb-px flex h-12 items-center gap-2 text-[15px] transition-colors ${
              isActive ? "font-medium text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink" : "text-muted can-hover:hover:text-ink"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="num text-faint">{tab.count}</span>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Segmented({ options, value, onChange, label, size = "md" }) {
  const height = size === "sm" ? "text-[13px]" : "text-sm";
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-raised p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={`${height} rounded-full px-3.5 transition-colors ${
            option.value === value ? "bg-ink font-medium text-ground" : "text-muted can-hover:hover:text-ink"
          }`}
          style={{ height: size === "sm" ? 28 : 34 }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
