import { useId, useState } from "react";

// Ten segments, one per point. Picking the current value again clears it (handled by the caller).
export function RatingInput({ value, onChange, disabled = false, label = "Your rating", size = "md" }) {
  const [preview, setPreview] = useState(null);
  const id = useId();
  const shown = preview ?? value;
  const segment = size === "sm" ? "h-6 w-[22px]" : "h-8 w-7 sm:w-8";

  const onKeyDown = (event) => {
    if (disabled) return;
    const current = value || 0;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(10, current + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, current - 1));
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
        <span id={id} className="text-muted">{label}</span>
        <span className="num text-ink">
          {shown ? (
            <>
              <span className="text-lg font-semibold text-accent">{shown}</span>
              <span className="text-faint"> /10</span>
            </>
          ) : (
            <span className="text-faint">Not rated</span>
          )}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="flex gap-1"
        onMouseLeave={() => setPreview(null)}
        onKeyDown={onKeyDown}
      >
        {Array.from({ length: 10 }, (_, index) => {
          const point = index + 1;
          const filled = shown && point <= shown;
          return (
            <button
              key={point}
              type="button"
              role="radio"
              aria-checked={value === point}
              aria-label={`${point} out of 10`}
              tabIndex={value ? (value === point ? 0 : -1) : point === 1 ? 0 : -1}
              disabled={disabled}
              onMouseEnter={() => setPreview(point)}
              onFocus={() => setPreview(point)}
              onBlur={() => setPreview(null)}
              onClick={() => onChange(point)}
              className={`${segment} rounded-[3px] transition-[background-color,transform] duration-100 active:scale-90 disabled:opacity-50 ${
                filled ? "bg-accent" : "bg-nested hover:bg-[#3a3a3a]"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function RatingValue({ value, className = "" }) {
  if (value === null || value === undefined) return <span className={`text-faint ${className}`}>-</span>;
  return (
    <span className={`num ${className}`}>
      <span className="font-semibold text-accent">{value}</span>
      <span className="text-faint"> /10</span>
    </span>
  );
}
