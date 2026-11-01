const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const numberFormatter = new Intl.NumberFormat("en-IN");
const compactFormatter = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// Dates from the API are "YYYY-MM-DD"; read them as local calendar days, not UTC instants.
const asDate = (value) => (typeof value === "string" && value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value));

export const formatDate = (value) => (value ? dateFormatter.format(asDate(value)) : "-");
export const formatLongDate = (value) => (value ? longDateFormatter.format(asDate(value)) : "-");
export const formatDayMonth = (value) => (value ? dayMonthFormatter.format(asDate(value)) : "-");
export const formatNumber = (value) => (value === null || value === undefined ? "-" : numberFormatter.format(value));
export const formatCompact = (value) => (value === null || value === undefined ? "-" : compactFormatter.format(value));

export const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest ? `${rest}m` : ""}`.trim() : `${rest}m`;
};

export const formatMoney = (amount) => (amount ? `$${compactFormatter.format(amount)}` : null);

export const timeAgo = (value) => {
  if (!value) return "";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const steps = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let amount = seconds;
  for (const [size, unit] of steps) {
    if (Math.abs(amount) < size) {
      return unit === "second" ? "just now" : relative.format(Math.round(amount), unit);
    }
    amount /= size;
  }
  return "";
};

export const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export const plural = (count, one, many = `${one}s`) => `${formatNumber(count)} ${count === 1 ? one : many}`;
