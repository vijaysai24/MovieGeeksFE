import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";

// Native <dialog> gives focus trapping, Escape to close and an inert page behind it for free.
export function Dialog({ open, onClose, title, children, size = "md", bare = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const width = size === "lg" ? "max-w-4xl" : size === "sm" ? "max-w-sm" : "max-w-lg";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
      className={`m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] ${width} overflow-y-auto overscroll-contain rounded-panel bg-surface p-0 text-ink shadow-float backdrop:bg-black/80`}
    >
      {open && (
        bare ? (
          <>
            <div className="flex items-center justify-between gap-4 py-1.5 pl-5 pr-2">
              <h2 className="truncate text-[15px] font-medium text-ink">{title}</h2>
              <IconButton label="Close" onClick={onClose}>
                <X size={18} aria-hidden="true" />
              </IconButton>
            </div>
            {children}
          </>
        ) : (
          <div className="p-6 sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="text-h3 font-semibold">{title}</h2>
              <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-1">
                <X size={18} aria-hidden="true" />
              </IconButton>
            </div>
            {children}
          </div>
        )
      )}
    </dialog>
  );
}
