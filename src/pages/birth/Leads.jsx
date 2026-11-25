import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Phone, Mail, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { INTEREST_OPTIONS } from "@/birth/config";

const STATUS = { new: "חדשה", contacted: "נוצר קשר", closed: "נסגרה" };
const interestLabel = (v) => INTEREST_OPTIONS.find((o) => o.value === v)?.label || v;

export default function Leads() {
  const { user, isLoadingAuth } = useAuth();
  const [leads, setLeads] = useState(null);

  const load = () => base44.entities.Lead.list("-created_date", 200).then(setLeads).catch(() => setLeads([]));
  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user]);

  if (isLoadingAuth) return null;
  if (user?.role !== "admin") return <Navigate to="/birth" replace />;
  if (!leads) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const setStatus = async (lead, status) => {
    await base44.entities.Lead.update(lead.id, { status });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">פניות מהאתר ({leads.length})</h1>
      {leads.length === 0 ? (
        <p className="text-muted-foreground">עדיין אין פניות.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="rounded-2xl bg-card border border-border p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="space-y-1">
                <p className="font-semibold">{l.full_name} <span className="text-sm font-normal text-muted-foreground">· {interestLabel(l.interest)}</span></p>
                <p className="text-sm text-muted-foreground">
                  {new Date(l.created_date).toLocaleString("he-IL")}
                  {l.due_date && ` · לידה משוערת ${new Date(l.due_date).toLocaleDateString("he-IL")}`}
                  {l.email_sent === false && " · ⚠️ המייל לא נשלח"}
                </p>
                {l.message && <p className="text-sm">{l.message}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`tel:${l.phone}`} className="p-2 rounded-full hover:bg-muted" aria-label="חיוג"><Phone className="w-4 h-4" /></a>
                <a href={`https://wa.me/972${l.phone.replace(/\D/g, "").replace(/^0/, "")}`} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-muted" aria-label="וואטסאפ"><MessageCircle className="w-4 h-4" /></a>
                {l.email && <a href={`mailto:${l.email}`} className="p-2 rounded-full hover:bg-muted" aria-label="מייל"><Mail className="w-4 h-4" /></a>}
                <select value={l.status || "new"} onChange={(e) => setStatus(l, e.target.value)} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm">
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
