// Stripe webhook endpoint (configure in Stripe Dashboard → Developers → Webhooks,
// event: checkout.session.completed). Required secret: STRIPE_WEBHOOK_SECRET
import { createClientFromRequest } from "npm:@base44/sdk@0.8.46";
import { activateMember, json, verifyWebhookSignature } from "../../shared/stripe.ts";

Deno.serve(async (req) => {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Webhook not configured" }, 500);

  const payload = await req.text();
  const valid = await verifyWebhookSignature(payload, req.headers.get("stripe-signature"), secret);
  if (!valid) return json({ error: "Invalid signature" }, 400);

  const event = JSON.parse(payload);
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata?.user_id;
    if (userId && session.payment_status === "paid") {
      const base44 = createClientFromRequest(req);
      await activateMember(base44, userId, session);
    }
  }
  return json({ received: true });
});
