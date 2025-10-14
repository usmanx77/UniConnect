import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { STORAGE_KEYS, APP_NAME, ERROR_MESSAGES } from "../lib/constants";
import { validators } from "../lib/utils/validation";

import { LoadingSpinner } from "./LoadingSpinner";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";

import { authService } from "../lib/services/authService";

export function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ identifier: "", password: "", login: "" });

  const { login, isLoading } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    setErrors(prev => ({ ...prev, identifier: "", login: "" }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors(prev => ({ ...prev, password: "", login: "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const newErrors = { identifier: "", password: "", login: "" };
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      newErrors.identifier = "Please enter your university email or username.";
    }

    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    if (newErrors.identifier || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({ identifier: "", password: "", login: "" });

    // Persist preference for session vs local storage
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_PERSIST, rememberMe ? "local" : "session");
    } catch (error) {
      console.error("Failed to persist auth preference:", error);
    }

    try {
      await login({ email: identifier, password });
      toast.success(toast.messages.success.LOGIN_SUCCESS);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("fetch") || error.message === "Failed to fetch") {
          setErrors(prev => ({ ...prev, login: "Network error. Please check your connection and try again." }));
        } else if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS) {
          setErrors(prev => ({ ...prev, login: "The username/email or password you entered is incorrect. Please try again." }));
        } else {
          setErrors(prev => ({ ...prev, login: "We couldn’t sign you in. Please try again in a moment." }));
        }
      } else {
        setErrors(prev => ({ ...prev, login: "An unexpected error occurred." }));
      }
    }

  };

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Signing in..." />;
  }
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-12 px-4 py-16 lg:flex-row lg:items-stretch">
        <div className="relative flex w-full max-w-xl flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.7)] backdrop-blur-xl">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(59,130,246,0.35),rgba(56,189,248,0.1))] opacity-90" />
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Campus-first community
            </span>
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Welcome back to {APP_NAME}</h1>
              <p className="mt-4 text-lg text-white/80">
                Dive into curated campus events, collaborate with peers, and stay ahead with a premium experience built exclusively for university life.
              </p>
            </div>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs font-semibold">1</span>
                <div>
                  <p className="font-semibold">All-in-one student hub</p>
                  <p className="text-white/70">Chat with classmates, discover societies, and manage your schedule effortlessly.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs font-semibold">2</span>
                <div>
                  <p className="font-semibold">Verified community</p>
                  <p className="text-white/70">Only official .edu.pk accounts keep your space safe, supportive, and authentic.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs font-semibold">3</span>
                <div>
                  <p className="font-semibold">Designed for focus</p>
                  <p className="text-white/70">Dark-mode friendly visuals, quick access navigation, and thoughtful micro-interactions.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="mt-12 flex items-center gap-3 text-sm text-white/70">
            <div className="flex -space-x-2">
              <span className="h-9 w-9 rounded-full border border-white/40 bg-white/30 backdrop-blur" />
              <span className="h-9 w-9 rounded-full border border-white/40 bg-white/30 backdrop-blur" />
              <span className="h-9 w-9 rounded-full border border-white/40 bg-white/30 backdrop-blur" />
            </div>
            <div>
              <p className="font-semibold text-white">Trusted by 20,000+ students</p>
              <p className="text-white/60">“The most polished campus experience we&apos;ve ever used.”</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/90 p-10 shadow-xl backdrop-blur-xl dark:bg-slate-900/80">
          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Sign in to continue</h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">Enter your details to access your personalised student dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                University email or username
              </label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                placeholder="you@your-university.edu.pk"
                autoComplete="username"
                className={`h-14 rounded-2xl border-[1.5px] bg-white/80 text-base text-slate-900 transition-all duration-300 focus-visible:ring-4 dark:bg-slate-900/60 dark:text-white ${
                  errors.identifier ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200/80" : "border-slate-200 focus-visible:border-primary focus-visible:ring-primary/30 dark:border-slate-700"
                }`}
                aria-invalid={!!errors.identifier}
                aria-describedby={errors.identifier ? "identifier-error" : undefined}
              />
              {errors.identifier && (
                <p id="identifier-error" className="text-sm font-medium text-red-600" role="alert" aria-live="polite">
                  {errors.identifier}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`h-14 rounded-2xl border-[1.5px] bg-white/80 pr-12 text-base text-slate-900 transition-all duration-300 focus-visible:ring-4 dark:bg-slate-900/60 dark:text-white ${
                    errors.password ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200/80" : "border-slate-200 focus-visible:border-primary focus-visible:ring-primary/30 dark:border-slate-700"
                  }`}
                  onKeyUp={(e) => setCapsLockOn((e as any).getModifierState?.("CapsLock"))}
                  onKeyDown={(e) => setCapsLockOn((e as any).getModifierState?.("CapsLock"))}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {capsLockOn && (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                  <span className="text-base">⚠️</span>
                  Caps Lock is on
                </div>
              )}
              {errors.password && (
                <p id="password-error" className="text-sm font-medium text-red-600" role="alert" aria-live="polite">
                  {errors.password}
                </p>
              )}
            </div>

            {errors.login && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
                {errors.login}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-3 font-medium text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me on this device
              </label>
              <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                <DialogTrigger asChild>
                  <button type="button" className="font-semibold text-primary transition-colors hover:text-primary/80">
                    Forgot password?
                  </button>
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
                      autoComplete="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetError("");
                        setResetSent(false);
                      }}
                    />
                    {resetError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert" aria-live="polite">
                        {resetError}
                      </div>
                    )}
                    {resetSent && <p className="text-sm font-medium text-primary">If an account exists, a reset email was sent.</p>}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={async () => {
                        const validation = validators.email(resetEmail);
                        if (!validation.valid) {
                          setResetError("Please enter a valid .edu.pk email");
                          return;
                        }
                        try {
                          await authService.requestPasswordReset(resetEmail);
                          setResetSent(true);
                          setResetError("");
                        } catch {
                          setResetError("Failed to send reset email");
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
              className="group w-full justify-center rounded-2xl bg-slate-900 py-4 text-base font-semibold text-white transition-all duration-300 hover:translate-y-[-2px] hover:bg-slate-800 hover:shadow-[0_20px_35px_-15px_rgba(15,23,42,0.6)] dark:bg-primary dark:hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            🔒 Only official .edu.pk university emails are allowed
          </div>

          <div className="mt-8 text-center text-base text-slate-600 dark:text-slate-300">
            Don&apos;t have an account?
            <button
              className="ml-2 font-semibold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-primary/80"
              onClick={() => (window.location.href = "/signup")}
            >
              Create one now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
