import React from "react";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-border bg-card hover:bg-muted",
  ghost: "hover:bg-muted",
  light: "bg-primary-foreground text-primary hover:opacity-90",
};
const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5",
  lg: "h-12 px-6 text-base",
};

export function Button({ variant = "primary", size = "md", loading = false, className = "", children, disabled = false, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

const fieldClass =
  "w-full rounded-xl border border-input bg-card px-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring";

export const Input = React.forwardRef(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} {...props} className={`${fieldClass} h-11 ${className}`} />;
});

export const Textarea = React.forwardRef(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} {...props} className={`${fieldClass} py-2 ${className}`} />;
});

export function Field({ label, hint = "", children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm" role="alert">{children}</div>;
}

export function Spinner() {
  return (
    <div className="flex justify-center py-32" role="status" aria-label="טוען">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
