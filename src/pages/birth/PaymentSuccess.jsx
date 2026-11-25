import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthCard from "@/birth/AuthCard";
import { callFunction, errorMessage } from "@/birth/api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ status: "checking", error: "" });

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) return setState({ status: "error", error: "חסר מזהה תשלום" });
    let tries = 0;
    const check = async () => {
      try {
        const data = await callFunction("verifyCheckout", { session_id: sessionId });
        if (data.active) return setState({ status: "active", error: "" });
        if (++tries < 5) return setTimeout(check, 2000);
        setState({ status: "error", error: "התשלום עדיין בעיבוד. רענני את הדף בעוד דקה." });
      } catch (err) {
        setState({ status: "error", error: errorMessage(err) });
      }
    };
    check();
  }, [params]);

  if (state.status === "checking") {
    return (
      <AuthCard title="מאמתות את התשלום…">
        <div className="flex justify-center py-6"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      </AuthCard>
    );
  }
  if (state.status === "active") {
    return (
      <AuthCard title="ברוכה הבאה לקורס! 🎉" subtitle="התשלום התקבל והגישה לתכנים פתוחה">
        <CheckCircle2 className="w-14 h-14 text-accent mx-auto mb-6" aria-hidden="true" />
        <Link to="/birth/lessons"><Button className="w-full h-12 rounded-full">כניסה לאזור התכנים</Button></Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="לא הצלחנו לאמת את התשלום">
      <p className="flex gap-2 text-sm text-destructive mb-6"><AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />{state.error}</p>
      <Link to="/birth/lessons"><Button variant="outline" className="w-full h-12 rounded-full">לאזור התכנים</Button></Link>
    </AuthCard>
  );
}
