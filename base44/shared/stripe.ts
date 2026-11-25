// Minimal Stripe REST helpers for Base44 backend functions (Deno).
// Card details never touch our servers: the user pays on Stripe's hosted
// Checkout page (PCI-DSS compliant); we only receive the payment result.

const STRIPE_API = "https://api.stripe.com/v1";

function secretKey(): string {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return key;
}

function toForm(params: Record<string, string | number | undefined>): string {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") body.append(k, String(v));
  }
  return body.toString();
}

async function stripeRequest(method: "GET" | "POST", path: string, params?: Record<string, string | number | undefined>) {
  const url = method === "GET" && params ? `${STRIPE_API}${path}?${toForm(params)}` : `${STRIPE_API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method === "POST" && params ? toForm(params) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe request failed (${res.status})`);
  }
  return data;
}

export function createCheckoutSession(params: Record<string, string | number | undefined>) {
  return stripeRequest("POST", "/checkout/sessions", params);
}

export function retrieveCheckoutSession(id: string) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) throw new Error("Invalid session id");
  return stripeRequest("GET", `/checkout/sessions/${id}`);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verifies the `Stripe-Signature` header (v1 scheme, 5 minute tolerance). */
export async function verifyWebhookSignature(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const timestamp = parts["t"];
  const signatures = header
    .split(",")
    .filter((p) => p.trim().startsWith("v1="))
    .map((p) => p.trim().slice(3));
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return signatures.some((s) => timingSafeEqual(s, expected));
}

/** Marks a user as a paying member. Call only with a service-role client. */
export async function activateMember(base44: any, userId: string, session: any) {
  await base44.asServiceRole.entities.User.update(userId, {
    subscription_status: "active",
    stripe_customer_id: session.customer || undefined,
    paid_at: new Date().toISOString(),
  });
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
