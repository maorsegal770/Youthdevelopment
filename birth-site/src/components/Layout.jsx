import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Flower2, Menu, X, Phone, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DOULA } from "@/lib/config";

const sectionLinks = [
  { hash: "services", label: "שירותים" },
  { hash: "course", label: "מה לומדים" },
  { hash: "faq", label: "שאלות נפוצות" },
  { hash: "contact", label: "יצירת קשר" },
];

export default function Layout() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  const logout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const links = (
    <>
      {sectionLinks.map((l) => (
        <a key={l.hash} href={onHome ? `#${l.hash}` : `/#${l.hash}`} className="hover:text-primary">{l.label}</a>
      ))}
      <span className="hidden md:block w-px h-5 bg-border" />
      {isAuthenticated ? (
        <>
          <NavLink to="/lessons" className="font-medium hover:text-primary">אזור התכנים</NavLink>
          {isAdmin && <NavLink to="/leads" className="font-medium hover:text-primary">פניות</NavLink>}
          <button onClick={logout} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" aria-hidden="true" />
            יציאה
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" className="font-medium hover:text-primary">התחברות</NavLink>
          <Link to="/register" className="rounded-full bg-primary text-primary-foreground px-4 py-2 font-medium text-center hover:opacity-90">הרשמה לקורס</Link>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 bg-card p-2 rounded z-50">דילוג לתוכן</a>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <Flower2 className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block font-bold">{DOULA.name}</span>
              <span className="block text-xs text-muted-foreground">{DOULA.title}</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="ניווט ראשי">{links}</nav>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="תפריט" aria-expanded={open}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {open && (
          <nav className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-4 text-sm" onClick={() => setOpen(false)} aria-label="ניווט ראשי">
            {links}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {DOULA.name} · {DOULA.title}</p>
          <p className="text-xs">התכנים באתר אינם מהווים תחליף לייעוץ רפואי.</p>
          <a href={DOULA.phoneHref} className="inline-flex items-center gap-2 hover:text-foreground">
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span dir="ltr">{DOULA.phone}</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
