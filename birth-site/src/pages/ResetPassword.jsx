import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api";
import { Button, Input, Field, FormError, Spinner } from "@/components/ui";
import AuthCard from "@/components/AuthCard";

// Reached from the reset email. Supabase signs the user in from the link,
// then she picks a new password here.
export default function ResetPassword() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) return <Spinner />;
  if (!isAuthenticated) {
    return (
      <AuthCard title="הקישור אינו תקף">
        <p>ייתכן שפג תוקפו. אפשר לבקש קישור חדש בדף "שכחתי סיסמה".</p>
      </AuthCard>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("הסיסמה צריכה להכיל לפחות 8 תווים");
    if (password !== confirm) return setError("הסיסמאות אינן תואמות");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(errorMessage(err));
    navigate("/lessons");
  };

  return (
    <AuthCard title="בחירת סיסמה חדשה">
      <form onSubmit={submit} className="space-y-4">
        <FormError>{error}</FormError>
        <Field label="סיסמה חדשה"><Input id="new-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        <Field label="אימות סיסמה"><Input id="new-pass-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>שמירה</Button>
      </form>
    </AuthCard>
  );
}
