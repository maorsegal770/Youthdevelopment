import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock, ShieldCheck, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/lib/AuthContext";
import AuthCard, { Steps, FormError } from "@/birth/AuthCard";
import { errorMessage, startCheckout } from "@/birth/api";

export default function BirthRegister() {
  const { isAuthenticated, user } = useAuth();
  // A logged-in user who hasn't paid yet goes straight to the payment step.
  const [step, setStep] = useState(isAuthenticated ? 2 : 0);
  const [form, setForm] = useState({ display_name: "", phone: "", due_date: "", email: "", password: "", confirm: "", terms: false });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (isAuthenticated && user?.subscription_status === "active") {
    return (
      <AuthCard title="את כבר רשומה 🎉" subtitle="המנוי שלך פעיל">
        <Link to="/birth/lessons"><Button className="w-full h-12 rounded-full">לאזור התכנים</Button></Link>
      </AuthCard>
    );
  }

  const submitDetails = async (e) => {
    e.preventDefault();
    setError("");
    if (form.display_name.trim().length < 2) return setError("נא למלא שם מלא");
    if (!/^0\d{8,9}$/.test(form.phone.replace(/[\s-]/g, ""))) return setError("נא למלא מספר טלפון תקין");
    if (form.password.length < 8) return setError("הסיסמה צריכה להכיל לפחות 8 תווים");
    if (form.password !== form.confirm) return setError("הסיסמאות אינן תואמות");
    if (!form.terms) return setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
    setLoading(true);
    try {
      await base44.auth.register({ email: form.email.trim(), password: form.password });
      setStep(1);
    } catch (err) {
      setError(errorMessage(err, "ההרשמה נכשלה"));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: form.email.trim(), otpCode: otp });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      else await base44.auth.loginViaEmailPassword(form.email.trim(), form.password);
      await base44.auth.updateMe({ display_name: form.display_name.trim(), phone: form.phone.trim(), due_date: form.due_date || undefined });
      setStep(2);
    } catch (err) {
      setError(errorMessage(err, "קוד האימות שגוי"));
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    setError("");
    setLoading(true);
    try {
      await startCheckout();
    } catch (err) {
      setError(errorMessage(err, "לא הצלחנו לפתוח את דף התשלום"));
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <AuthCard steps={<Steps current={1} />} title="אימות כתובת המייל" subtitle={`שלחנו קוד בן 6 ספרות אל ${form.email}`}>
        <FormError>{error}</FormError>
        <div className="flex justify-center mb-6" dir="ltr">
          <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 rounded-full" onClick={verify} disabled={loading || otp.length < 6}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} אימות והמשך
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          לא הגיע קוד?{" "}
          <button className="text-primary font-medium hover:underline" onClick={() => base44.auth.resendOtp(form.email.trim()).catch((e) => setError(errorMessage(e)))}>
            שליחה חוזרת
          </button>
        </p>
      </AuthCard>
    );
  }

  if (step === 2) {
    return (
      <AuthCard steps={<Steps current={2} />} title="תשלום מאובטח" subtitle="שלב אחרון וזהו – הגישה לתכנים נפתחת מיד לאחר התשלום">
        <FormError>{error}</FormError>
        <ul className="space-y-3 text-sm mb-6">
          <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />התשלום מתבצע בדף סליקה מאובטח (תקן PCI-DSS). פרטי האשראי לא נשמרים באתר.</li>
          <li className="flex gap-3"><Lock className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />החיבור מוצפן (HTTPS) מקצה לקצה.</li>
          <li className="flex gap-3"><CreditCard className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />לאחר התשלום תחזרי לאתר ותיכנסי עם המייל והסיסמה שבחרת.</li>
        </ul>
        <Button className="w-full h-12 rounded-full text-base" onClick={pay} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} מעבר לתשלום מאובטח
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      steps={<Steps current={0} />}
      title="הרשמה לקורס הכנה ללידה"
      subtitle="יוצרים חשבון, משלמים בדף מאובטח ונכנסים לתכנים"
      footer={<>כבר רשומה? <Link to="/birth/login" className="text-primary font-medium hover:underline">להתחברות</Link></>}
    >
      <FormError>{error}</FormError>
      <form onSubmit={submitDetails} className="space-y-4" noValidate>
        <Field label="שם מלא"><Input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} autoComplete="name" required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="טלפון"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} type="tel" dir="ltr" autoComplete="tel" required /></Field>
          <Field label="תאריך לידה משוער"><Input value={form.due_date} onChange={(e) => set("due_date", e.target.value)} type="date" /></Field>
        </div>
        <Field label="אימייל (שם המשתמש שלך)"><Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" autoComplete="email" required /></Field>
        <Field label="סיסמה (לפחות 8 תווים)"><Input value={form.password} onChange={(e) => set("password", e.target.value)} type="password" autoComplete="new-password" required /></Field>
        <Field label="אימות סיסמה"><Input value={form.confirm} onChange={(e) => set("confirm", e.target.value)} type="password" autoComplete="new-password" required /></Field>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-1 accent-[hsl(var(--primary))]" />
          <span>קראתי ואני מסכימה לתנאי השימוש ולמדיניות הפרטיות. התכנים אינם תחליף לייעוץ רפואי.</span>
        </label>
        <Button type="submit" className="w-full h-12 rounded-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} המשך
        </Button>
      </form>
    </AuthCard>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
