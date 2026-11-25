// Stripe webhook (Stripe Dashboard → Developers → Webhooks).
// Events: checkout.session.completed, checkout.session.async_payment_succeeded
// Secret: STRIPE_WEBHOOK_SECRET
import { json } from "../_shared/http.ts";
import { activateMember, adminClient } from "../_shared/supabase.ts";
import { verifyWebhookSignature } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Webhook not configured" }, 500);

  const payload = await req.text();
  if (!(await verifyWebhookSignature(payload, req.headers.get("stripe-signature"), secret))) {
    return json({ error: "Invalid signature" }, 400);
  }

  const event = JSON.parse(payload);
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata?.user_id;
    if (userId && session.payment_status === "paid") {
      try {
        await activateMember(adminClient(), userId, session);
      } catch (e) {
        console.error("activation failed", e);
        return json({ error: "activation failed" }, 500); // Stripe will retry
      }
    }
  }
  return json({ received: true });
});
