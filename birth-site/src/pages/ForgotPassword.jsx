import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/api";
import { Button, Input, Field, FormError } from "@/components/ui";
import AuthCard from "@/components/AuthCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) return setError(errorMessage(err));
    setSent(true);
  };

  return (
    <AuthCard title="איפוס סיסמה" footer={<Link to="/login" className="text-primary hover:underline">חזרה להתחברות</Link>}>
      {sent ? (
        <p role="status">אם הכתובת רשומה באתר, נשלח אלייך מייל עם קישור לבחירת סיסמה חדשה.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <FormError>{error}</FormError>
          <Field label="אימייל">
            <Input id="forgot-email" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>שליחת קישור לאיפוס</Button>
        </form>
      )}
    </AuthCard>
  );
}
