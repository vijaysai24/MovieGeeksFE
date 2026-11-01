import { useRegion, regionName } from "../../Hooks/useRegion";
import { useRegions } from "../../Hooks/useCatalogReference";

// Every availability on the site depends on this; it reads as a sentence, not a settings control.
// A native select is as wide as its longest option ("Saint Vincent and the Grenadines"), so the
// visible part shows only the current country and the real select sits invisibly on top of it.
export function RegionSelect({ className = "" }) {
  const { region, setRegion } = useRegion();
  const { data: regions = [] } = useRegions();
  const options = regions.length ? regions : [{ code: region, name: regionName(region) }];
  const current = options.find((option) => option.code === region)?.name || regionName(region);

  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <span>Showing in</span>
      <span className="relative inline-flex min-w-0 items-center gap-1 text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink hover:text-accent">
        <span className="truncate">{current}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true" className="flex-none">
          <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <select
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          aria-label="Country for release dates and streaming"
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        >
          {options.map((option) => (
            <option key={option.code} value={option.code}>{option.name}</option>
          ))}
        </select>
      </span>
    </span>
  );
}
