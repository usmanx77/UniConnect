import { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { login, isLoading } = useAuth();
  const toast = useToast();

  const handleGoogleLogin = async () => {
    try {
      // Simulate Google OAuth
      await login({
        email: "student@university.edu",
        password: "password123",
      });
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
      newErrors.email = "Please enter a valid university email (.edu)";
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 dark:from-primary/10 dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-white text-2xl">U</span>
          </div>
          <h1 className="mb-2">UniConnect</h1>
          <p className="text-muted-foreground">Connect with your university community</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <Button
            className="w-full rounded-xl mb-6 h-12 shadow-sm"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
            Sign in with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm">University Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@university.edu"
                className="rounded-xl h-11"
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-11"
                required
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-destructive mt-1">{errors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl h-11"
              variant="outline"
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Only @university.edu emails are allowed
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <button 
            className="text-primary hover:underline"
            onClick={() => window.location.href = '/signup'}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
