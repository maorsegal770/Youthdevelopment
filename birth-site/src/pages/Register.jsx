import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { errorMessage, startCheckout } from "@/lib/api";
import { isValidPhone } from "@/lib/config";
import { Button, Input, Field, FormError } from "@/components/ui";
import AuthCard, { Steps } from "@/components/AuthCard";

export default function Register() {
  const { isAuthenticated, isMember, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ display_name: "", phone: "", due_date: "", email: "", password: "", confirm: "", terms: false });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const email = form.email.trim().toLowerCase();

  // Already signed in: skip straight to payment (or to the lessons).
  const currentStep = !authLoading && isAuthenticated ? 2 : step;

  if (isAuthenticated && isMember) {
    return (
      <AuthCard title="את כבר רשומה" subtitle="המנוי שלך פעיל">
        <Link to="/lessons" className="block"><Button size="lg" className="w-full">לאזור התכנים</Button></Link>
      </AuthCard>
    );
  }

  const submitDetails = async (e) => {
    e.preventDefault();
    setError("");
    if (form.display_name.trim().length < 2) return setError("נא למלא שם מלא");
    if (!isValidPhone(form.phone)) return setError("נא למלא מספר טלפון תקין, למשל 050-1234567");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("נא למלא כתובת אימייל תקינה");
    if (form.password.length < 8) return setError("הסיסמה צריכה להכיל לפחות 8 תווים");
    if (form.password !== form.confirm) return setError("הסיסמאות אינן תואמות");
    if (!form.terms) return setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");

    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: { display_name: form.display_name.trim(), phone: form.phone.trim(), due_date: form.due_date || null },
          emailRedirectTo: `${window.location.origin}/register`,
        },
      });
      if (err) throw err;
      // Supabase hides existing accounts by returning a user with no identities.
      if (data.user && data.user.identities?.length === 0) {
        setError("כתובת המייל כבר רשומה. אפשר להתחבר");
        return;
      }
      setStep(data.session ? 2 : 1);
    } catch (err) {
      setError(errorMessage(err, "ההרשמה נכשלה"));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "signup" });
      if (err) throw err;
      setStep(2);
    } catch (err) {
      setError(errorMessage(err, "הקוד שגוי"));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setInfo("");
    const { error: err } = await supabase.auth.resend({ type: "signup", email });
    if (err) setError(errorMessage(err));
    else setInfo("שלחנו קוד חדש");
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

  if (currentStep === 1) {
    return (
      <AuthCard steps={<Steps current={1} />} title="אימות כתובת המייל" subtitle={`שלחנו קוד אל ${email}`}>
        <form onSubmit={verify} className="space-y-4">
          <FormError>{error}</FormError>
          {info && <p className="text-sm text-accent" role="status">{info}</p>}
          <Field label="קוד אימות">
            <Input
              id="otp"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              className="text-center text-2xl tracking-[0.4em]"
              autoFocus
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading} disabled={code.length < 6}>אימות והמשך</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          לא הגיע קוד? בדקי בתיקיית הספאם, או{" "}
          <button className="text-primary font-medium hover:underline" onClick={resend}>שלחו לי קוד חדש</button>
        </p>
      </AuthCard>
    );
  }

  if (currentStep === 2) {
    return (
      <AuthCard steps={<Steps current={2} />} title="תשלום מאובטח" subtitle="שלב אחרון – הגישה לתכנים נפתחת מיד לאחר התשלום">
        <FormError>{error}</FormError>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />התשלום מתבצע בדף סליקה מאובטח (תקן PCI-DSS). פרטי האשראי לא עוברים דרך האתר ולא נשמרים בו.</li>
          <li className="flex gap-3"><Lock className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />החיבור מוצפן (HTTPS) מקצה לקצה.</li>
          <li className="flex gap-3"><CreditCard className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />אחרי התשלום תחזרי לאתר, ומאז תיכנסי עם המייל והסיסמה שבחרת.</li>
        </ul>
        <Button size="lg" className="w-full" onClick={pay} loading={loading}>
          {!loading && <Lock className="w-4 h-4" aria-hidden="true" />} מעבר לתשלום מאובטח
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      steps={<Steps current={0} />}
      title="הרשמה לקורס הכנה ללידה"
      subtitle="יוצרים חשבון, משלמים בדף מאובטח ונכנסים לתכנים"
      footer={<>כבר רשומה? <Link to="/login" className="text-primary font-medium hover:underline">להתחברות</Link></>}
    >
      <form onSubmit={submitDetails} className="space-y-4" noValidate>
        <FormError>{error}</FormError>
        <Field label="שם מלא"><Input id="reg-name" value={form.display_name} onChange={(e) => set("display_name", e.target.value)} autoComplete="name" required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="טלפון"><Input id="reg-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} type="tel" dir="ltr" autoComplete="tel" required /></Field>
          <Field label="תאריך לידה משוער"><Input id="reg-due" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} type="date" /></Field>
        </div>
        <Field label="אימייל (שם המשתמש שלך)"><Input id="reg-email" value={form.email} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" autoComplete="email" required /></Field>
        <Field label="סיסמה (לפחות 8 תווים)"><Input id="reg-pass" value={form.password} onChange={(e) => set("password", e.target.value)} type="password" autoComplete="new-password" required /></Field>
        <Field label="אימות סיסמה"><Input id="reg-confirm" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} type="password" autoComplete="new-password" required /></Field>
        <label className="flex items-start gap-2 text-sm">
          <input id="reg-terms" type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-1 accent-[hsl(var(--primary))]" />
          <span>קראתי ואני מסכימה לתנאי השימוש ולמדיניות הפרטיות. התכנים אינם תחליף לייעוץ רפואי.</span>
        </label>
        <Button type="submit" size="lg" className="w-full" loading={loading}>המשך</Button>
      </form>
    </AuthCard>
  );
}
