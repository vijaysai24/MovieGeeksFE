import { Button } from "./Button";

// A flat bar at the real size of what it stands in for, so nothing shifts when data lands.
export function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`skeleton rounded ${className}`} />;
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={`h-3.5 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

// An empty section keeps its frame and says, in one sentence, what would fill it.
export function EmptyState({ title, children, action, className = "" }) {
  return (
    <div className={`rounded-lg bg-surface px-6 py-10 text-center ${className}`}>
      {title && <p className="text-base font-medium text-ink">{title}</p>}
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

// Shown inside the block that failed, never as a full-screen banner.
export function ErrorState({ message = "This didn't load.", onRetry, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-lg bg-[#1d1215] px-5 py-4 text-sm ${className}`} role="alert">
      <span className="h-2 w-2 flex-none rounded-full bg-negative" aria-hidden="true" />
      <span className="text-[#f1c1ca]">{message}</span>
      {onRetry && (
        <Button size="sm" variant="ghost" onClick={onRetry} className="ml-auto text-ink">
          Try again
        </Button>
      )}
    </div>
  );
}
