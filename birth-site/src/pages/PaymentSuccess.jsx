import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { callFunction, errorMessage } from "@/lib/api";
import { Button, Spinner } from "@/components/ui";
import AuthCard from "@/components/AuthCard";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const { isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const [state, setState] = useState({ status: "checking", error: "" });

  useEffect(() => {
    if (authLoading) return;
    const sessionId = params.get("session_id");
    if (!isAuthenticated) return setState({ status: "error", error: "נא להתחבר כדי להשלים את אימות התשלום" });
    if (!sessionId) return setState({ status: "error", error: "חסר מזהה תשלום" });
    let tries = 0;
    let timer;
    const check = async () => {
      try {
        const data = await callFunction("verify-checkout", { session_id: sessionId });
        if (data.active) {
          await refreshProfile();
          return setState({ status: "active", error: "" });
        }
        if (++tries < 5) timer = setTimeout(check, 2000);
        else setState({ status: "error", error: "התשלום עדיין בעיבוד. רענני את הדף בעוד דקה." });
      } catch (err) {
        setState({ status: "error", error: errorMessage(err) });
      }
    };
    check();
    return () => clearTimeout(timer);
  }, [params, authLoading, isAuthenticated]);

  if (state.status === "checking") return <Spinner />;
  if (state.status === "active") {
    return (
      <AuthCard title="ברוכה הבאה לקורס!" subtitle="התשלום התקבל והגישה לתכנים פתוחה">
        <CheckCircle2 className="w-14 h-14 text-accent mx-auto" aria-hidden="true" />
        <Link to="/lessons" className="block"><Button size="lg" className="w-full">כניסה לאזור התכנים</Button></Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="לא הצלחנו לאמת את התשלום">
      <p className="flex gap-2 text-sm text-destructive"><AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />{state.error}</p>
      <Link to={isAuthenticated ? "/lessons" : "/login"} className="block"><Button variant="outline" size="lg" className="w-full">{isAuthenticated ? "לאזור התכנים" : "להתחברות"}</Button></Link>
    </AuthCard>
  );
}
