import React, { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { INTEREST_OPTIONS, DOULA } from "./config";

const EMPTY = { full_name: "", phone: "", email: "", interest: "course", due_date: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.full_name.trim().length < 2) return setError("נא למלא שם מלא");
    if (!/^0\d{8,9}$/.test(form.phone.replace(/[\s-]/g, ""))) return setError("נא למלא מספר טלפון תקין");
    setStatus("sending");
    try {
      const res = await base44.functions.invoke("submitLead", form);
      const data = res?.data ?? res;
      if (data?.error) throw new Error(data.error);
      setStatus("sent");
      setForm(EMPTY);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || `השליחה נכשלה. אפשר להתקשר ישירות ${DOULA.phone}`);
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-3" role="status">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto" aria-hidden="true" />
        <h3 className="text-xl font-bold">הפרטים נשלחו, תודה!</h3>
        <p className="text-muted-foreground">אחזור אלייך בהקדם. בינתיים אפשר גם לכתוב לי בוואטסאפ.</p>
        <Button variant="outline" onClick={() => setStatus("idle")}>שליחת פנייה נוספת</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-4 shadow-sm" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="שם מלא *">
          <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} autoComplete="name" required />
        </Field>
        <Field label="טלפון *">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} type="tel" inputMode="tel" dir="ltr" autoComplete="tel" required />
        </Field>
        <Field label="אימייל">
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" autoComplete="email" />
        </Field>
        <Field label="תאריך לידה משוער">
          <Input value={form.due_date} onChange={(e) => set("due_date", e.target.value)} type="date" />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">במה אוכל לעזור?</legend>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((o) => (
            <label key={o.value} className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${form.interest === o.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
              <input type="radio" name="interest" value={o.value} checked={form.interest === o.value} onChange={() => set("interest", o.value)} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="הודעה (לא חובה)">
        <Textarea rows={3} value={form.message} onChange={(e) => set("message", e.target.value)} />
      </Field>

      {/* Honeypot against spam bots */}
      <input type="text" name="website" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <Button type="submit" className="w-full h-12 rounded-full text-base" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        שליחת פרטים
      </Button>
      <p className="text-xs text-muted-foreground text-center">הפרטים נשלחים ישירות לרחל לאה ומשמשים ליצירת קשר בלבד.</p>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
