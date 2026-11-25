import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthCard, { FormError } from "@/birth/AuthCard";
import { errorMessage } from "@/birth/api";

export default function BirthLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      window.location.href = "/birth/lessons";
    } catch (err) {
      setError(errorMessage(err, "המייל או הסיסמה שגויים"));
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="כניסה לאזור התכנים"
      subtitle="התחברי עם המייל והסיסמה שבחרת בהרשמה"
      footer={<>עוד לא רשומה? <Link to="/birth/register" className="text-primary font-medium hover:underline">להרשמה לקורס</Link></>}
    >
      <FormError>{error}</FormError>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">אימייל</span>
          <Input type="email" dir="ltr" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block space-y-1.5">
          <span className="flex justify-between text-sm font-medium">
            סיסמה
            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-normal">שכחתי סיסמה</Link>
          </span>
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <Button type="submit" className="w-full h-12 rounded-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} כניסה
        </Button>
      </form>
    </AuthCard>
  );
}
