// Called from the payment-success page. Confirms with Stripe that the session
// was paid by THIS user, then activates the membership. The webhook does the
// same thing server-to-server, so access is granted even if the user closes
// the tab before returning.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.46";
import { activateMember, json, retrieveCheckoutSession } from "../../shared/stripe.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return json({ error: "נדרשת התחברות" }, 401);
    if (user.subscription_status === "active") return json({ active: true });

    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id) return json({ error: "Missing session_id" }, 400);

    const session = await retrieveCheckoutSession(String(session_id));
    const belongsToUser = session.client_reference_id === user.id;
    if (!belongsToUser) return json({ error: "Session does not belong to user" }, 403);
    if (session.payment_status !== "paid") return json({ active: false, status: session.payment_status });

    await activateMember(base44, user.id, session);
    return json({ active: true });
  } catch (error) {
    console.error("verifyCheckout failed", error);
    return json({ error: "אימות התשלום נכשל" }, 500);
  }
});
