import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { APP_NAME, STORAGE_KEYS } from "../lib/constants";
import { authService } from "../lib/services/authService";

export function VerifyEmailPage() {
  const [seconds, setSeconds] = useState(30);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const email = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA) || sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!raw) return "your .edu.pk email";
      return JSON.parse(raw)?.email || "your .edu.pk email";
    } catch { return "your .edu.pk email"; }
  })();

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const resend = async () => {
    if (seconds > 0) return;
    setSending(true);
    try {
      await authService.sendVerificationEmail(email);
      setSent(true);
      setSeconds(30);
    } finally {
      setSending(false);
    }
  };

  const markVerified = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMAIL_VERIFIED, "true");
      // Reload to let the router advance to onboarding
      window.location.reload();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/25 ring-4 ring-primary/20">
          <span className="text-white text-3xl font-brand">C</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to <span className="font-brand">{APP_NAME}</span>!</h1>
        <p className="text-muted-foreground mb-6">
          We just sent a confirmation link to <span className="font-medium">{email}</span>.
          Tap the link to verify your account.
        </p>
        <div className="space-y-3">
          <Button onClick={markVerified} className="w-full rounded-2xl h-12">
            I clicked the email, continue
          </Button>
          <Button onClick={resend} variant="outline" disabled={seconds > 0 || sending} className="w-full rounded-2xl h-12">
            {seconds > 0 ? `Resend available in ${seconds}s` : sent ? "Sent! Resend again" : sending ? "Sending..." : "Resend email"}
          </Button>
        </div>
      </div>
    </div>
  );
}






