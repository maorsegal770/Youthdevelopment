import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/api";
import { Button, Input, Field, FormError } from "@/components/ui";
import AuthCard from "@/components/AuthCard";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setLoading(false);
    if (err) return setError(errorMessage(err, "המייל או הסיסמה שגויים"));
    navigate("/lessons");
  };

  return (
    <AuthCard
      title="כניסה לאזור התכנים"
      subtitle="התחברי עם המייל והסיסמה שבחרת בהרשמה"
      footer={<>עוד לא רשומה? <Link to="/register" className="text-primary font-medium hover:underline">להרשמה לקורס</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError>{error}</FormError>
        <Field label="אימייל">
          <Input id="login-email" type="email" dir="ltr" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="סיסמה">
          <Input id="login-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <div className="text-left">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">שכחתי סיסמה</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>כניסה</Button>
      </form>
    </AuthCard>
  );
}
