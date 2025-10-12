import { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./ui/dialog";
import { STORAGE_KEYS, APP_NAME } from "../lib/constants";
import { authService } from "../lib/services/authService";

export function LoginPage() {
  const [identifier, setIdentifier] = useState("");
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
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const newErrors = { email: "", password: "" } as { email: string; password: string };
    const isEmail = identifier.includes("@");
    if (isEmail) {
      if (!validators.email(identifier)) {
        newErrors.email = "Please use a valid .edu.pk university email";
      }
    } else {
      const res = validators.username(identifier);
      if (!res.valid) newErrors.email = res.message || "Invalid username";
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
      await login({ email: identifier, password });
      toast.success(toast.messages.success.LOGIN_SUCCESS);
    } catch {
      toast.error(toast.messages.error.INVALID_CREDENTIALS);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Signing in..." />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 dark:from-primary/10 dark:via-accent/10 dark:to-primary/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/25 ring-4 ring-primary/10 dark:ring-primary/30">
            <span className="text-white text-3xl font-bold">U</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">{APP_NAME}</h1>
          <p className="text-muted-foreground text-lg">Connect with your university community</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border p-8 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="identifier" className="block text-sm font-semibold text-foreground">Username or University Email</label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="username or yourname@uni.edu.pk"
                autoComplete="username"
                className="rounded-2xl h-14 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 text-lg px-4"
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive mt-2 flex items-center gap-1" role="alert" aria-live="polite">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="rounded-2xl h-14 pr-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 text-lg px-4"
                  onKeyUp={(e) => setCapsLockOn((e as any).getModifierState?.("CapsLock"))}
                  onKeyDown={(e) => setCapsLockOn((e as any).getModifierState?.("CapsLock"))}
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {capsLockOn && (
                <p className="text-xs text-muted-foreground" aria-live="polite">Caps Lock is on</p>
              )}
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive mt-2 flex items-center gap-1" role="alert" aria-live="polite">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                    {resetError && <p className="text-sm text-destructive" role="alert" aria-live="polite">{resetError}</p>}
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
              className="w-full rounded-2xl h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
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

          <div className="text-center mt-8 p-4 bg-accent rounded-2xl border border-border">
            <p className="text-sm text-primary font-medium">
              🔒 Only official .edu.pk university emails are allowed
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-lg">
            Don&apos;t have an account?{" "}
            <button 
              className="text-primary hover:underline transition-colors duration-200"
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
