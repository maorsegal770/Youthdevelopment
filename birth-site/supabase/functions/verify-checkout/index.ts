// Called from the payment-success page. Confirms with Stripe that the session
// was paid by THIS user and activates the membership. The webhook does the
// same server-to-server, so access opens even if the tab was closed.
import { json, preflight } from "../_shared/http.ts";
import { activateMember, adminClient, getUser } from "../_shared/supabase.ts";
import { retrieveCheckoutSession } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  try {
    const admin = adminClient();
    const user = await getUser(req, admin);
    if (!user) return json({ error: "נדרשת התחברות" }, 401);

    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id) return json({ error: "Missing session_id" }, 400);

    const session = await retrieveCheckoutSession(String(session_id));
    if (session.client_reference_id !== user.id) return json({ error: "Session does not belong to user" }, 403);
    if (session.payment_status !== "paid") return json({ active: false, status: session.payment_status });

    await activateMember(admin, user.id, session);
    return json({ active: true });
  } catch (e) {
    console.error("verify-checkout failed", e);
    return json({ error: "אימות התשלום נכשל" }, 500);
  }
});
