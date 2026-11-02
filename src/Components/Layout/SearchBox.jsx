import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { tmdbImage, profileImage } from "../../Services/images";
import { useDebouncedValue } from "../../Hooks/useDebouncedValue";

const hrefOf = (item) => (item.mediaType === "person" ? `/person/${item.id}` : `/${item.mediaType}/${item.id}`);

const sublineOf = (item) => {
  if (item.mediaType === "person") {
    return [item.knownForDepartment === "Directing" ? "Director" : item.knownForDepartment, item.knownFor?.[0]].filter(Boolean).join(" · ");
  }
  return [item.year, item.mediaType === "tv" ? "Series" : "Film"].filter(Boolean).join(" · ");
};

// Combobox search: suggestions as you type, arrows to move, Enter to open one or see all results.
export function SearchBox({ autoFocus = false, onNavigate, className = "", size = "md" }) {
  const large = size === "lg";
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebouncedValue(query.trim(), 200);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["catalog", "autocomplete", debounced.toLowerCase()],
    queryFn: () => catalogApi.autocomplete(debounced),
    enabled: debounced.length >= 2,
    staleTime: 10 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  useEffect(() => setActive(-1), [debounced]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const go = (path) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    onNavigate?.();
    navigate(path);
  };

  const showList = open && debounced.length >= 2;

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && suggestions[active]) go(hrefOf(suggestions[active]));
      else if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={`${listId}-input`} className="sr-only">Search films, series and people</label>
      <Search size={large ? 20 : 16} className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-faint ${large ? "left-5" : "left-3.5"}`} aria-hidden="true" />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        name="q"
        autoComplete="off"
        spellCheck={false}
        placeholder="Search films, series, people…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        className={`w-full rounded-full bg-raised text-ink placeholder:text-faint ring-1 ring-inset ring-transparent transition-shadow can-hover:hover:ring-control focus:outline-none focus:ring-ink/60 [&::-webkit-search-cancel-button]:hidden ${large ? "h-14 pl-14 pr-12 text-[17px]" : "h-9 pl-10 pr-9 text-sm"}`}
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className={`absolute top-1/2 -translate-y-1/2 rounded-full p-1.5 text-faint can-hover:hover:text-ink ${large ? "right-4" : "right-2"}`}
        >
          <X size={large ? 18 : 14} aria-hidden="true" />
        </button>
      )}

      {showList && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-panel bg-surface shadow-float ring-1 ring-line md:min-w-[420px]">
          <ul id={listId} role="listbox" aria-label="Suggestions" className="max-h-[70vh] overflow-y-auto py-2">
            {suggestions.map((item, index) => {
              const image = item.mediaType === "person" ? profileImage(item.profilePath, "w92") : tmdbImage(item.posterPath, "w92");
              return (
                <li
                  key={`${item.mediaType}:${item.id}`}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={active === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(hrefOf(item))}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${active === index ? "bg-raised" : ""}`}
                >
                  {image ? (
                    <img src={image} alt="" width="32" height="48" loading="lazy" className={`h-12 w-8 flex-none bg-raised object-cover ${item.mediaType === "person" ? "rounded-full h-8!" : "rounded-[3px]"}`} />
                  ) : (
                    <span className="h-12 w-8 flex-none rounded-[3px] bg-raised" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] text-ink">{item.title || item.name}</span>
                    <span className="block truncate text-[13px] text-faint">{sublineOf(item)}</span>
                  </span>
                </li>
              );
            })}
            {!suggestions.length && (
              <li className="px-4 py-3 text-[15px] text-faint">{isFetching ? "Searching…" : `Nothing matches “${debounced}”`}</li>
            )}
          </ul>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
            className="block w-full bg-raised px-4 py-3 text-left text-[15px] text-muted can-hover:hover:text-ink"
          >
            See all results for “{query.trim()}”
          </button>
        </div>
      )}
    </div>
  );
}
