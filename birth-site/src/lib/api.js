import { supabase } from "./supabase";

/** Calls an edge function and returns its JSON body; throws with a readable message. */
export async function callFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    try {
      const payload = await error.context?.json?.();
      if (payload?.error) message = payload.error;
    } catch {
      /* keep the generic message */
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

/** Sends the signed-in user to Stripe's hosted (PCI-compliant) payment page. */
export async function startCheckout() {
  const data = await callFunction("create-checkout", { origin: window.location.origin });
  if (data.already_active) {
    window.location.href = "/lessons";
    return;
  }
  if (!data.url) throw new Error("לא התקבל קישור לתשלום");
  window.location.href = data.url;
}

const AUTH_ERRORS = {
  "Invalid login credentials": "המייל או הסיסמה שגויים",
  "Email not confirmed": "עוד לא אימתת את כתובת המייל",
  "User already registered": "כתובת המייל כבר רשומה. אפשר להתחבר",
  "Token has expired or is invalid": "הקוד שגוי או שפג תוקפו",
};

export function errorMessage(err, fallback = "משהו השתבש, נסי שוב") {
  const msg = err?.message;
  if (!msg) return fallback;
  for (const [en, he] of Object.entries(AUTH_ERRORS)) if (msg.includes(en)) return he;
  if (/rate limit/i.test(msg)) return "יותר מדי ניסיונות. נסי שוב בעוד כמה דקות";
  if (/password/i.test(msg) && /characters/i.test(msg)) return "הסיסמה צריכה להכיל לפחות 8 תווים";
  if (/fetch|network/i.test(msg)) return "אין חיבור לשרת. בדקי את החיבור ונסי שוב";
  return msg;
}
