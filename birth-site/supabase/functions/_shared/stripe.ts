// Minimal Stripe REST helpers. Card details never touch our servers: the
// customer pays on Stripe's hosted Checkout page (PCI-DSS); we only receive
// the result and verify it server-side.

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
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method === "POST" && params ? toForm(params) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe request failed (${res.status})`);
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

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Verifies the `Stripe-Signature` header (v1 scheme, 5 minute tolerance). */
export async function verifyWebhookSignature(payload: string, header: string | null, secret: string, now = Date.now()): Promise<boolean> {
  if (!header) return false;
  const items = header.split(",").map((p) => p.trim());
  const timestamp = items.find((p) => p.startsWith("t="))?.slice(2);
  const signatures = items.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
  const expected = await hmacHex(secret, `${timestamp}.${payload}`);
  return signatures.some((s) => timingSafeEqual(s, expected));
}

// Exported for tests.
export { hmacHex };
