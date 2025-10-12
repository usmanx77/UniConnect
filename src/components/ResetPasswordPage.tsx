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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
        {!hasSession && (
          <p className="text-sm text-destructive mb-4">
            The reset link is invalid or expired. Please request a new reset email.
          </p>
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
            <p className="text-xs text-destructive">Passwords do not match.</p>
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


