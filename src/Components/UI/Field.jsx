import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const surface = "rounded-control bg-raised px-3.5 text-[15px] text-ink placeholder:text-faint ring-1 ring-inset ring-transparent transition-shadow can-hover:hover:ring-control focus:outline-none focus:ring-ink/70";
const control = `w-full ${surface}`;

// Label above the field; any limit the field enforces is stated beside it, tied by aria-describedby.
// Selects size to their content unless the caller gives them a width.
export function Field({ label, hint, error, children, className = "" }) {
  const id = useId();
  const hintId = hint || error ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[15px] font-medium text-ink">{label}</label>
      {children({ id, "aria-describedby": hintId, "aria-invalid": error ? true : undefined })}
      {(hint || error) && (
        <p id={hintId} className={`mt-2 text-[13px] ${error ? "text-negative" : "text-faint"}`}>{error || hint}</p>
      )}
    </div>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input className={`${control} h-11 ${className}`} {...props} />;
}

// A password field with a show/hide toggle, so long passwords can be checked before submitting.
export function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} spellCheck={false} autoCapitalize="none" className={`${control} h-11 pr-12 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-faint can-hover:hover:text-ink"
      >
        {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}

export function TextArea({ className = "", ...props }) {
  return <textarea className={`${control} min-h-32 py-3 leading-relaxed ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={`${surface} h-9 max-w-full cursor-pointer appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-9 text-sm ${className}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23b4b4b4' stroke-width='1.5'%3E%3Cpath d='m3 4.5 3 3 3-3'/%3E%3C/svg%3E\")" }}
      {...props}
    >
      {children}
    </select>
  );
}
