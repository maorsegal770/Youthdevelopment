// Creates a Stripe Checkout session for the logged-in user and returns its URL.
// Required secrets: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
import { createClientFromRequest } from "npm:@base44/sdk@0.8.46";
import { createCheckoutSession, json } from "../../shared/stripe.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return json({ error: "נדרשת התחברות" }, 401);
    if (user.subscription_status === "active") return json({ already_active: true });

    const priceId = Deno.env.get("STRIPE_PRICE_ID");
    if (!priceId) return json({ error: "התשלום עדיין לא הוגדר באתר" }, 500);

    const { origin } = await req.json().catch(() => ({}));
    // Only allow redirects back to an http(s) origin; never to arbitrary paths.
    let base = "";
    try {
      const u = new URL(String(origin));
      if (u.protocol === "https:" || u.protocol === "http:") base = u.origin;
    } catch { /* ignore */ }
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
      success_url: `${base}/birth/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/birth/lessons?payment=canceled`,
    });

    return json({ url: session.url });
  } catch (error) {
    console.error("createCheckoutSession failed", error);
    return json({ error: "לא הצלחנו לפתוח את דף התשלום. נסי שוב בעוד רגע." }, 500);
  }
});
