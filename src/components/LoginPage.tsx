import { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./ui/dialog";
import { STORAGE_KEYS, APP_NAME, ERROR_MESSAGES } from "../lib/constants";

import { authService } from "../lib/services/authService";

export function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ identifier: "", password: "", login: "" });
  const [realtimeErrors, setRealtimeErrors] = useState({ identifier: "", password: "" });

  const { login, isLoading } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Real-time validation handlers
  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);

    if (!value.trim()) {
      setRealtimeErrors(prev => ({ ...prev, identifier: "" }));
      return;
    }

    const isEmail = value.includes("@");
    if (isEmail) {
      const validation = validators.email(value);
      setRealtimeErrors(prev => ({ ...prev, identifier: validation.valid ? "" : validation.message || "" }));
    } else {
      const validation = validators.username(value);
      setRealtimeErrors(prev => ({ ...prev, identifier: validation.valid ? "" : validation.message || "" }));
    }
  };


  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (!value) {
      setRealtimeErrors(prev => ({ ...prev, password: "" }));
      return;
    }

    const validation = validators.password(value);
    setRealtimeErrors(prev => ({ ...prev, password: validation.valid ? "" : validation.message || "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const newErrors = { identifier: "", password: "", login: "" } as { identifier: string; password: string; login: string };
    const isEmail = identifier.includes("@");
    if (isEmail) {
      const validation = validators.email(identifier);
      if (!validation.valid) {
        newErrors.identifier = validation.message || "Invalid email";
      }
    } else {
      const validation = validators.username(identifier);
      if (!validation.valid) newErrors.identifier = validation.message || "Invalid username";
    }

    const passwordValidation = validators.password(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message || "Invalid password";
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
        if (error.message.includes('network') || error.message.includes('fetch') || error.message === 'Failed to fetch') {
          setErrors(prev => ({ ...prev, login: 'Network error. Please check your connection and try again.' }));
        } else if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS) {
          setErrors(prev => ({ ...prev, login: 'Email or password is incorrect!' }));
        } else {
          setErrors(prev => ({ ...prev, login: 'Login failed. Please try again.' }));
        }
      } else {
        setErrors(prev => ({ ...prev, login: 'An unexpected error occurred.' }));
      }
    }

  };

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Signing in..." />;
  }
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-brand text-primary mb-3">{APP_NAME}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Connect with your university community</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-8 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="identifier" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Username or University Email</label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                placeholder="username or yourname@uni.edu.pk"
                autoComplete="username"
                className={`rounded-2xl h-14 border-2 transition-all duration-300 text-lg px-4 ${
                  realtimeErrors.identifier || errors.identifier
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : identifier && !realtimeErrors.identifier
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                    : "border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary/20"
                }`}
                required
                aria-invalid={!!errors.identifier}
                aria-describedby={errors.identifier ? "identifier-error" : undefined}

              />
              {(errors.identifier || realtimeErrors.identifier) && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p id="identifier-error" className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold" role="alert" aria-live="polite">
                    <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.identifier || realtimeErrors.identifier}
                  </p>
                </div>
              )}
              {identifier && !realtimeErrors.identifier && !errors.identifier && (

                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2 font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Looks good!
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`rounded-2xl h-14 pr-12 border-2 transition-all duration-300 text-lg px-4 ${
                    realtimeErrors.password || errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : password && !realtimeErrors.password
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                      : "border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary/20"
                  }`}
                  onKeyUp={(e) => setCapsLockOn((e as any).getModifierState?.("CapsLock"))}
                  onKeyDown={(e) => setCapsLockOn((e as any).getModifierState?.("CapsLock"))}
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {capsLockOn && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1" aria-live="polite">
                    <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                    Caps Lock is on
                  </p>
                </div>
              )}
              {(errors.password || realtimeErrors.password) && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p id="password-error" className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold" role="alert" aria-live="polite">
                    <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password || realtimeErrors.password}
                  </p>
                </div>
              )}
              {password && !realtimeErrors.password && !errors.password && !errors.login && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2 font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Password looks good!
                  </p>
                </div>
              )}
              {errors.login && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p id="login-error" className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold" role="alert" aria-live="polite">
                    <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.login}
                  </p>
                </div>
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
                Remember me on this device
              </label>
              <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                <DialogTrigger asChild>
                  <button type="button" className="text-sm text-primary hover:text-primary/80 font-semibold">Forgot password?</button>
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
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm text-red-700 dark:text-red-300 font-semibold flex items-center gap-2" role="alert" aria-live="polite">
                          <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {resetError}
                        </p>
                      </div>
                    )}
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
              className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary hover:border-primary/80"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
              🔒 Only official .edu.pk university emails are allowed
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            Don&apos;t have an account?{" "}
            <button
              className="text-primary hover:text-primary/80 font-bold underline transition-colors duration-200"
              onClick={() => window.location.href = '/signup'}
            >
              Create one now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
