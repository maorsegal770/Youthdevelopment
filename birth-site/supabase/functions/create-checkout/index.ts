// Creates a Stripe Checkout session for the signed-in user.
// Secrets: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
import { json, preflight } from "../_shared/http.ts";
import { adminClient, getUser } from "../_shared/supabase.ts";
import { createCheckoutSession } from "../_shared/stripe.ts";

/** Returns a safe http(s) origin or "" – we never redirect to arbitrary paths. */
export function safeOrigin(value: unknown): string {
  try {
    const u = new URL(String(value));
    return u.protocol === "https:" || u.protocol === "http:" ? u.origin : "";
  } catch {
    return "";
  }
}

if (import.meta.main) {
  Deno.serve(async (req) => {
    const pre = preflight(req);
    if (pre) return pre;
    try {
      const admin = adminClient();
      const user = await getUser(req, admin);
      if (!user) return json({ error: "נדרשת התחברות" }, 401);

      const { data: profile } = await admin.from("profiles").select("subscription_status").eq("id", user.id).single();
      if (profile?.subscription_status === "active") return json({ already_active: true });

      const priceId = Deno.env.get("STRIPE_PRICE_ID");
      if (!priceId) return json({ error: "התשלום עדיין לא הוגדר באתר" }, 500);

      const { origin } = await req.json().catch(() => ({}));
      const allowed = Deno.env.get("SITE_URL");
      const base = safeOrigin(allowed || origin);
      if (!base) return json({ error: "Invalid origin" }, 400);

      const session = await createCheckoutSession({
        mode: "payment",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": 1,
        customer_email: user.email,
        client_reference_id: user.id,
        "metadata[user_id]": user.id,
        "payment_intent_data[metadata][user_id]": user.id,
        locale: "auto",
        success_url: `${base}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/lessons?payment=canceled`,
      });
      return json({ url: session.url });
    } catch (e) {
      console.error("create-checkout failed", e);
      return json({ error: "לא הצלחנו לפתוח את דף התשלום. נסי שוב בעוד רגע." }, 500);
    }
  });
}
