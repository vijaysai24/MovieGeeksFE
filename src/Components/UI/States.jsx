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
export function EmptyState({ title, children, action, icon: Icon, className = "" }) {
  return (
    <div className={`rounded-panel bg-surface px-6 py-12 text-center ${className}`}>
      {Icon && (
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-raised text-muted">
          <Icon size={20} aria-hidden="true" />
        </span>
      )}
      {title && <p className="text-h3 font-semibold text-ink">{title}</p>}
      {children && <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

// Shown inside the block that failed, never as a full-screen banner.
export function ErrorState({ message = "This didn't load.", onRetry, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-panel bg-[#1d1215] px-5 py-4 text-[15px] ${className}`} role="alert">
      <span className="h-2 w-2 flex-none rounded-full bg-negative" aria-hidden="true" />
      <span className="text-[#f1c1ca]">{message}</span>
      {onRetry && (
        <Button size="sm" variant="ghost" onClick={onRetry} className="ml-auto text-ink">
          Try Again
        </Button>
      )}
    </div>
  );
}
