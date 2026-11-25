import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.119.2";

/** Service-role client: bypasses RLS. Use only for trusted server-side writes. */
export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returns the signed-in user for the request's bearer token, or null. */
export async function getUser(req: Request, admin: SupabaseClient) {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/** Marks a user as a paying member. */
export async function activateMember(admin: SupabaseClient, userId: string, session: { customer?: string | null }) {
  const { error } = await admin
    .from("profiles")
    .update({
      subscription_status: "active",
      stripe_customer_id: session.customer || null,
      paid_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;
}
