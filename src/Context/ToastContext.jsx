import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

// Quiet confirmation for actions taken away from their result ("Added to your wishlist").
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const show = useCallback((message, { tone = "neutral", action } = {}) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, message, tone, action }]);
    setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto flex max-w-md items-center gap-4 rounded-full px-5 py-3 text-sm shadow-[0_12px_32px_rgba(0,0,0,0.5)] ${
                toast.tone === "error" ? "bg-[#2c1a20] text-[#ff8fa3]" : "bg-ink text-ground"
              }`}
            >
              <span>{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick();
                    dismiss(toast.id);
                  }}
                  className="font-semibold underline-offset-4 can-hover:hover:underline"
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
};
