import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { INTEREST_OPTIONS } from "@/lib/config";
import { Spinner } from "@/components/ui";

const STATUS = { new: "חדשה", contacted: "נוצר קשר", closed: "נסגרה" };
const interestLabel = (v) => INTEREST_OPTIONS.find((o) => o.value === v)?.label || v;

export default function Leads() {
  const { isAdmin, loading, isAuthenticated, profile } = useAuth();
  const [leads, setLeads] = useState(null);

  const load = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(300);
    setLeads(data || []);
  };
  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (loading) return <Spinner />;
  if (!isAdmin) return <Navigate to="/" replace />;
  if (!leads) return <Spinner />;

  const setStatus = async (lead, status) => {
    await supabase.from("leads").update({ status }).eq("id", lead.id);
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
                  {new Date(l.created_at).toLocaleString("he-IL")}
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
