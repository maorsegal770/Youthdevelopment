import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Menu, X, Sparkles } from 'lucide-react';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <aside className="fixed top-0 right-0 h-full w-64 bg-card border-l border-border p-5 hidden md:block z-40">
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-foreground leading-tight">תכנית ההעצמה</h1>
            <p className="text-xs text-muted-foreground">תשפ"ז 26-27</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="font-bold text-sm">תכנית ההעצמה</h1>
        </div>
        <button onClick={() => setMobileOpen(true)}><Menu className="w-6 h-6" /></button>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-64 bg-card border-l border-border p-5">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold">תכנית ההעצמה</span>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="md:mr-64 p-6 md:p-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}