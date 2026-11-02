import { formatNumber } from "../../Services/format";

// Single-series charts in the one accent hue. Marks are capped at 24px, rounded at the data end
// and square at the baseline; values show on hover and live in a table for screen readers, and
// text always stays in the text colours.

export function ColumnChart({ data, label, height = 112, unit = "", valueLabel = (item) => `${formatNumber(item.value)}${unit}` }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <figure>
      <div className="flex items-end gap-0.5 border-b border-line" style={{ height }} aria-hidden="true">
        {data.map((item) => (
          <div key={item.label} className="group relative flex h-full flex-1 items-end justify-center">
            <div
              className="w-full max-w-6 rounded-t-[4px] bg-accent transition-opacity can-hover:group-hover:opacity-80"
              style={{ height: item.value ? `${Math.max(3, (item.value / max) * (height - 20))}px` : 0 }}
            />
            <span className="num pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-nested px-2 py-1 text-[12px] text-ink opacity-0 shadow-float transition-opacity can-hover:group-hover:opacity-100">
              {item.title || item.label}: {valueLabel(item)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-0.5" aria-hidden="true">
        {data.map((item) => (
          <span key={item.label} className="num flex-1 truncate text-center text-[12px] text-faint">{item.label}</span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}><th scope="row">{item.title || item.label}</th><td>{valueLabel(item)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// Ranked horizontal bars: name on the left, value at the bar's tip.
export function BarList({ items, label }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ul aria-label={label} className="space-y-3">
      {items.map((item) => (
        <li key={item.key ?? item.label} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
          <span className="truncate text-[15px] text-ink">{item.label}</span>
          <span className="flex min-w-0 items-center gap-3">
            <span className="h-2.5 flex-none rounded-r-[4px] bg-accent" style={{ width: `${Math.max(2, (item.value / max) * 78)}%` }} aria-hidden="true" />
            <span className="num flex-none text-[13px] text-muted">{item.display ?? formatNumber(item.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
