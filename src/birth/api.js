import { base44 } from "@/api/base44Client";

/** Extracts a user-facing message from an SDK / function error. */
export function errorMessage(err, fallback = "משהו השתבש, נסי שוב") {
  return err?.data?.error || err?.response?.data?.error || err?.data?.message || err?.message || fallback;
}

/** Calls a backend function and returns its JSON body (throws on `{error}`). */
export async function callFunction(name, payload) {
  const res = await base44.functions.invoke(name, payload);
  const data = res?.data ?? res;
  if (data?.error) throw new Error(data.error);
  return data;
}

/** Sends the logged-in user to Stripe's hosted (PCI-compliant) payment page. */
export async function startCheckout() {
  const data = await callFunction("createCheckoutSession", { origin: window.location.origin });
  if (data.already_active) {
    window.location.href = "/birth/lessons";
    return;
  }
  if (!data.url) throw new Error("לא התקבל קישור לתשלום");
  window.location.href = data.url;
}
