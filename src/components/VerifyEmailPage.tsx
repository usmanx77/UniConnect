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
      // Use the same storage where user data is stored
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA) || sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
      const storage = userData && sessionStorage.getItem(STORAGE_KEYS.USER_DATA) ? sessionStorage : localStorage;
      storage.setItem(STORAGE_KEYS.EMAIL_VERIFIED, "true");
      // Reload to let the router advance to onboarding
      window.location.reload();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-primary">Welcome to <span className="font-brand text-primary">{APP_NAME}</span>!</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
          We just sent a confirmation link to <span className="font-bold text-primary">{email}</span>.
          <br />Tap the link to verify your account.
        </p>
        <div className="space-y-3">
          <Button onClick={markVerified} className="w-full rounded-2xl h-12 bg-primary hover:bg-primary/90 text-white font-bold border-2 border-primary hover:border-primary/80">
            I clicked the email, continue
          </Button>
          <Button onClick={resend} variant="outline" disabled={seconds > 0 || sending} className="w-full rounded-2xl h-12 border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/10 font-bold text-slate-700 dark:text-slate-300">
            {seconds > 0 ? `Resend available in ${seconds}s` : sent ? "Sent! Resend again" : sending ? "Sending..." : "Resend email"}
          </Button>
        </div>
      </div>
    </div>
  );
}
