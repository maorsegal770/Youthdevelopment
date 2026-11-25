// Public endpoint for the landing-page contact form: stores the lead and
// emails it to Rachel. Optional secret: LEADS_NOTIFY_EMAIL (defaults below).
import { createClientFromRequest } from "npm:@base44/sdk@0.8.46";
import { json } from "../../shared/stripe.ts";

const DEFAULT_NOTIFY_EMAIL = "rachellea.segal@gmail.com";
const INTEREST_LABELS: Record<string, string> = {
  course: "קורס הכנה ללידה",
  doula: "ליווי לידה (דולה)",
  consultation: "התייעצות",
  other: "אחר",
};

const clean = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const input = await req.json().catch(() => ({}));
    // Honeypot field: real users never fill it.
    if (input.website) return json({ ok: true });

    const lead = {
      full_name: clean(input.full_name, 100),
      phone: clean(input.phone, 20),
      email: clean(input.email, 120),
      interest: INTEREST_LABELS[input.interest] ? input.interest : "other",
      due_date: /^\d{4}-\d{2}-\d{2}$/.test(input.due_date || "") ? input.due_date : undefined,
      message: clean(input.message, 2000),
      status: "new",
    };

    if (lead.full_name.length < 2) return json({ error: "נא למלא שם מלא" }, 400);
    if (!/^0\d{8,9}$|^\+?972\d{8,9}$/.test(lead.phone.replace(/[\s-]/g, ""))) {
      return json({ error: "נא למלא מספר טלפון תקין" }, 400);
    }
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return json({ error: "כתובת האימייל אינה תקינה" }, 400);
    }

    const base44 = createClientFromRequest(req);
    const record = await base44.asServiceRole.entities.Lead.create(lead);

    const body = [
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

    let emailSent = false;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: Deno.env.get("LEADS_NOTIFY_EMAIL") || DEFAULT_NOTIFY_EMAIL,
        subject: `פנייה חדשה: ${INTEREST_LABELS[lead.interest]} – ${lead.full_name}`,
        body,
        from_name: "אתר הכנה ללידה",
      });
      emailSent = true;
    } catch (e) {
      // The lead is already saved, so the request is not lost.
      console.error("SendEmail failed", e);
    }
    await base44.asServiceRole.entities.Lead.update(record.id, { email_sent: emailSent });

    return json({ ok: true });
  } catch (error) {
    console.error("submitLead failed", error);
    return json({ error: "השליחה נכשלה. אפשר להתקשר ישירות 053-2778770" }, 500);
  }
});
