// Public endpoint for the landing-page contact form: validates, stores the
// lead and emails it to Rachel through Resend.
// Secrets: RESEND_API_KEY (required for email), LEADS_NOTIFY_EMAIL, LEADS_FROM_EMAIL
import { json, preflight } from "../_shared/http.ts";
import { adminClient } from "../_shared/supabase.ts";

const DEFAULT_NOTIFY_EMAIL = "rachellea.segal@gmail.com";
// Resend's shared sender works without a domain, but only delivers to the
// email address that owns the Resend account.
const DEFAULT_FROM = "אתר הכנה ללידה <onboarding@resend.dev>";

const INTEREST_LABELS: Record<string, string> = {
  course: "קורס הכנה ללידה",
  doula: "ליווי לידה (דולה)",
  consultation: "התייעצות",
  other: "אחר",
};

const clean = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);

export function validateLead(input: Record<string, unknown>) {
  const lead = {
    full_name: clean(input.full_name, 100),
    phone: clean(input.phone, 20),
    email: clean(input.email, 120) || null,
    interest: typeof input.interest === "string" && INTEREST_LABELS[input.interest] ? input.interest : "other",
    due_date: /^\d{4}-\d{2}-\d{2}$/.test(String(input.due_date || "")) ? String(input.due_date) : null,
    message: clean(input.message, 2000) || null,
  };
  if (lead.full_name.length < 2) return { error: "נא למלא שם מלא" };
  if (!/^0\d{8,9}$|^\+?972\d{8,9}$/.test(lead.phone.replace(/[\s-]/g, ""))) return { error: "נא למלא מספר טלפון תקין" };
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return { error: "כתובת האימייל אינה תקינה" };
  return { lead };
}

async function sendEmail(lead: NonNullable<ReturnType<typeof validateLead>["lead"]>) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const text = [
    "התקבלה פנייה חדשה מדף הנחיתה:",
    "",
    `שם: ${lead.full_name}`,
    `טלפון: ${lead.phone}`,
    `אימייל: ${lead.email || "-"}`,
    `מעוניינת ב: ${INTEREST_LABELS[lead.interest]}`,
    `תאריך לידה משוער: ${lead.due_date || "-"}`,
    "",
    "הודעה:",
    lead.message || "-",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("LEADS_FROM_EMAIL") || DEFAULT_FROM,
      to: [Deno.env.get("LEADS_NOTIFY_EMAIL") || DEFAULT_NOTIFY_EMAIL],
      reply_to: lead.email || undefined,
      subject: `פנייה חדשה: ${INTEREST_LABELS[lead.interest]} – ${lead.full_name}`,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}

if (import.meta.main) {
  Deno.serve(async (req) => {
    const pre = preflight(req);
    if (pre) return pre;
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    try {
      const input = await req.json().catch(() => ({}));
      if (input.website) return json({ ok: true }); // honeypot: silently ignore bots

      const result = validateLead(input);
      if (result.error) return json({ error: result.error }, 400);
      const lead = result.lead!;

      const admin = adminClient();
      const { data: row, error } = await admin.from("leads").insert(lead).select("id").single();
      if (error) throw error;

      let emailSent = false;
      try {
        await sendEmail(lead);
        emailSent = true;
      } catch (e) {
        console.error("email failed", e); // lead is saved, so nothing is lost
      }
      await admin.from("leads").update({ email_sent: emailSent }).eq("id", row.id);

      return json({ ok: true });
    } catch (e) {
      console.error("submit-lead failed", e);
      return json({ error: "השליחה נכשלה. אפשר להתקשר ישירות 053-2778770" }, 500);
    }
  });
}
