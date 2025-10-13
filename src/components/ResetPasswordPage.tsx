import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LoadingSpinner } from "./LoadingSpinner";
import { useToast } from "../hooks/useToast";
import { supabase } from "../lib/supabaseClient";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setHasSession(Boolean(data.session));
      } finally {
        setChecking(false);
      }
      const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
        setHasSession(Boolean(session));
      });
      unsub = () => sub.subscription.unsubscribe();
    };
    init();
    return () => { unsub && unsub(); };
  }, []);

  const canSubmit = password.length >= 8 && password === confirm && hasSession && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      toast.success("Password updated. You can sign in now.");
      window.location.href = "/";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return <LoadingSpinner fullScreen size="lg" text="Preparing reset..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-8 max-w-md w-full relative z-10">
        <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
        {!hasSession && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              The reset link is invalid or expired. Please request a new reset email.
            </p>
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label htmlFor="newpass" className="block text-sm font-semibold text-foreground">New password</label>
            <Input
              id="newpass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="rounded-2xl h-12 border-2 border-border focus:border-primary focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="confirmpass" className="block text-sm font-semibold text-foreground">Confirm password</label>
            <Input
              id="confirmpass"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="rounded-2xl h-12 border-2 border-border focus:border-primary focus:ring-primary/20"
            />
          </div>
          {password && password.length < 8 && (
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters.</p>
          )}
          {confirm && confirm !== password && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
                <svg className="w-3 h-3 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Passwords do not match.
              </p>
            </div>
          )}
          <Button
            className="w-full rounded-2xl h-12 bg-gradient-to-r from-primary to-accent text-white"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}


