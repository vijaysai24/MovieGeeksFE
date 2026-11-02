import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { tmdbImage } from "../../Services/images";
import { useDebouncedValue } from "../../Hooks/useDebouncedValue";
import { TextInput } from "../UI/Field";

// Type to find a film or series, pick one. Titles already chosen show a tick and can't be picked twice.
export function TitlePicker({ onPick, chosen = new Set(), label = "Find a film or series", disabled = false, autoFocus = false }) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 250);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["catalog", "autocomplete", debounced.toLowerCase()],
    queryFn: () => catalogApi.autocomplete(debounced),
    enabled: debounced.length >= 2,
  });
  const options = suggestions.filter((item) => item.mediaType !== "person");

  return (
    <div>
      <TextInput
        type="search"
        name="title-search"
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
        placeholder={`${label}…`}
        value={query}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(event) => setQuery(event.target.value)}
      />
      {debounced.length >= 2 && (
        <ul className="mt-2 max-h-64 overflow-y-auto overscroll-contain rounded-control bg-raised py-1" aria-busy={isFetching}>
          {!options.length && !isFetching && <li className="px-3.5 py-3 text-[14px] text-faint">Nothing matches “{debounced}”.</li>}
          {options.map((item) => {
            const picked = chosen.has(`${item.mediaType}:${item.id}`);
            return (
              <li key={`${item.mediaType}:${item.id}`}>
                <button
                  type="button"
                  disabled={picked || disabled}
                  onClick={() => {
                    onPick(item);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors disabled:cursor-default can-hover:hover:bg-nested"
                >
                  {item.posterPath ? (
                    <img src={tmdbImage(item.posterPath, "w92")} alt="" width="28" height="42" className="h-[42px] w-7 flex-none rounded-[3px] bg-nested object-cover" />
                  ) : (
                    <span className="h-[42px] w-7 flex-none rounded-[3px] bg-nested" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[15px] text-ink">
                    {item.title} <span className="num text-faint">{item.year || "TBA"} · {item.mediaType === "tv" ? "Series" : "Film"}</span>
                  </span>
                  {picked ? <Check size={16} className="flex-none text-positive" aria-label="Already added" /> : <Plus size={16} className="flex-none text-faint" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
