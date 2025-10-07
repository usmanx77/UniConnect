import { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./ui/dialog";
import { STORAGE_KEYS } from "../lib/constants";
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

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithOAuth("google");
      // If Supabase is configured, this will redirect. Otherwise, fallback succeeded.
      toast.success(toast.messages.success.LOGIN_SUCCESS);
    } catch {
      toast.error(toast.messages.error.AUTH_FAILED);
    }
  };

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
    } catch {}
    
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">UniConnect</h1>
          <p className="text-muted-foreground text-lg">Connect with your university community</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border p-8 relative">
          <Button
            className="w-full rounded-2xl mb-6 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-card hover:bg-accent text-foreground border-2 border-border hover:border-primary/40 font-semibold"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground font-medium">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">University Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@your-university.edu.pk"
                className="rounded-2xl h-14 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 text-lg px-4"
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive mt-2 flex items-center gap-1">
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
                  placeholder="••••••••"
                  className="rounded-2xl h-14 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 text-lg px-4 pr-12"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive mt-2 flex items-center gap-1">
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
