import { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";
import { Eye, EyeOff, Sparkle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./ui/dialog";
import { APP_NAME, STORAGE_KEYS } from "../lib/constants";
import { authService } from "../lib/services/authService";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { login, isLoading } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const highlights = [
    "Curated happenings tailored to your societies",
    "Meaningful circles that elevate your campus journey",
    "A calm, minimal space for focused collaboration",
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const newErrors = { email: "", password: "" };
    
    if (!validators.email(email)) {
      newErrors.email = "Please enter a valid university email (.edu.pk)";
    }
    
    const passwordValidation = validators.password(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message || "";
    }
    
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({ email: "", password: "" });
    // Persist preference for session vs local storage
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_PERSIST, rememberMe ? "local" : "session");
    } catch (error) {
      console.error("Failed to persist auth preference:", error);
    }
    
    try {
      await login({ email, password });
      toast.success(toast.messages.success.LOGIN_SUCCESS);
    } catch {
      toast.error(toast.messages.error.INVALID_CREDENTIALS);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Signing in..." />;
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(107,114,255,0.12),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,0.16),transparent_55%),linear-gradient(180deg,rgba(246,249,255,0.92)_0%,rgba(233,240,255,0.75)_55%,rgba(240,245,255,0.98)_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.28),transparent_55%),linear-gradient(180deg,rgba(5,7,15,0.94)_0%,rgba(5,7,15,0.96)_55%,rgba(5,7,15,0.98)_100%)]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-160px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/40 via-accent/40 to-purple-400/40 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-sky-200/60 via-primary/50 to-purple-400/40 blur-3xl dark:from-sky-500/20 dark:via-primary/30 dark:to-purple-500/20" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground shadow-[0_18px_45px_-30px_rgba(15,23,42,0.5)] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-muted-foreground/80">
              <Sparkle className="h-4 w-4 text-primary" /> Inspired Campus Living
            </span>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted-foreground/70">Welcome to</p>
              <h1 className="font-logo text-5xl text-foreground drop-shadow-sm sm:text-6xl">{APP_NAME}</h1>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground/90 lg:mx-0">
                A calm, luxurious hub for students to curate their societies, discover campus opportunities, and stay close to the people who move their journey forward.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {highlights.map(item => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-purple-500" />
                  <p className="text-sm font-medium text-foreground/90 dark:text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_40px_80px_-45px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="border-b border-white/60 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent px-8 py-6 dark:border-white/10 dark:from-primary/15 dark:via-primary/10">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Sign in</span>
                  <h2 className="text-2xl font-semibold text-foreground">Access your campus concierge</h2>
                  <p className="text-sm text-muted-foreground">Use your verified university credentials to continue.</p>
                </div>
              </div>

              <div className="px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-foreground">University Email</label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@your-university.edu.pk"
                      className="h-14 rounded-2xl border-2 border-border bg-input-background/60 px-4 text-lg transition-all duration-300 focus:border-primary focus:ring-primary/20"
                      required
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-2 flex items-center gap-1 text-sm text-destructive">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-foreground">Password</label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-14 rounded-2xl border-2 border-border bg-input-background/60 px-4 pr-12 text-lg transition-all duration-300 focus:border-primary focus:ring-primary/20"
                        required
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="mt-2 flex items-center gap-1 text-sm text-destructive">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember me
                    </label>
                    <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-sm font-semibold text-primary hover:text-primary/80">Forgot password?</button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset your password</DialogTitle>
                          <DialogDescription>Enter your .edu.pk email and we will send reset instructions.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Input
                            type="email"
                            placeholder="yourname@your-university.edu.pk"
                            value={resetEmail}
                            onChange={(e) => {
                              setResetEmail(e.target.value);
                              setResetError("");
                              setResetSent(false);
                            }}
                          />
                          {resetError && <p className="text-sm text-destructive">{resetError}</p>}
                          {resetSent && <p className="text-sm text-primary">If an account exists, a reset email was sent.</p>}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            onClick={async () => {
                              if (!validators.email(resetEmail)) {
                                setResetError("Please enter a valid .edu.pk email");
                                return;
                              }
                              try {
                                await authService.requestPasswordReset(resetEmail);
                                setResetSent(true);
                                setResetError("");
                              } catch {
                                setResetError("We couldn't send the reset email. Try again later.");
                              }
                            }}
                          >
                            Send reset link
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-purple-500 text-lg font-semibold text-white shadow-[0_28px_55px_-30px_rgba(37,99,235,0.85)] transition-transform duration-300 hover:-translate-y-0.5"
                    disabled={isLoading}
                  >
                    Sign in to {APP_NAME}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
