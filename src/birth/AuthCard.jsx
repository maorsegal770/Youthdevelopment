import React from "react";

export default function AuthCard({ title, subtitle = "", children, footer = null, steps = null }) {
  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-16">
      {steps}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      </div>
      <div className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-sm">{children}</div>
      {footer && <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>}
    </div>
  );
}

export function Steps({ current }) {
  const items = ["פרטים אישיים", "אימות מייל", "תשלום מאובטח"];
  return (
    <ol className="flex items-center justify-center gap-2 mb-8 text-xs sm:text-sm" aria-label="שלבי ההרשמה">
      {items.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold ${i <= current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} aria-current={i === current ? "step" : undefined}>
            {i + 1}
          </span>
          <span className={i === current ? "font-medium" : "text-muted-foreground"}>{label}</span>
          {i < items.length - 1 && <span className="w-4 sm:w-8 h-px bg-border" />}
        </li>
      ))}
    </ol>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm" role="alert">{children}</div>;
}
