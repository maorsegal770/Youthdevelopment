// Run: deno test supabase/functions/_shared/functions_test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";
import { hmacHex, verifyWebhookSignature } from "./stripe.ts";
import { validateLead } from "../submit-lead/index.ts";
import { safeOrigin } from "../create-checkout/index.ts";

Deno.test("webhook signature: valid, tampered, stale", async () => {
  const secret = "whsec_test";
  const payload = '{"type":"checkout.session.completed"}';
  const t = Math.floor(Date.now() / 1000);
  const sig = await hmacHex(secret, `${t}.${payload}`);
  assert(await verifyWebhookSignature(payload, `t=${t},v1=${sig}`, secret));
  assert(!(await verifyWebhookSignature(payload + " ", `t=${t},v1=${sig}`, secret)));
  assert(!(await verifyWebhookSignature(payload, `t=${t},v1=${sig}`, "whsec_other")));
  assert(!(await verifyWebhookSignature(payload, `t=${t - 600},v1=${await hmacHex(secret, `${t - 600}.${payload}`)}`, secret)));
  assert(!(await verifyWebhookSignature(payload, null, secret)));
});

Deno.test("lead validation", () => {
  assertEquals(validateLead({ full_name: "נועה", phone: "050-1234567", interest: "doula" }).lead?.interest, "doula");
  assertEquals(validateLead({ full_name: "נועה", phone: "123", interest: "course" }).error, "נא למלא מספר טלפון תקין");
  assertEquals(validateLead({ full_name: "", phone: "0501234567" }).error, "נא למלא שם מלא");
  assertEquals(validateLead({ full_name: "נועה", phone: "0501234567", interest: "hack" }).lead?.interest, "other");
  assertEquals(validateLead({ full_name: "נועה", phone: "0501234567", due_date: "2027-13" }).lead?.due_date, null);
  assertEquals(validateLead({ full_name: "נועה", phone: "0501234567", email: "bad" }).error, "כתובת האימייל אינה תקינה");
});

Deno.test("safe origin", () => {
  assertEquals(safeOrigin("https://site.netlify.app/some/path"), "https://site.netlify.app");
  assertEquals(safeOrigin("javascript:alert(1)"), "");
  assertEquals(safeOrigin(undefined), "");
});
