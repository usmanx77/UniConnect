import { useEffect, useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";
import { APP_NAME } from "../lib/constants";
import { authService } from "../lib/services/authService";

export function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [detectedDomain, setDetectedDomain] = useState<string | null>(null);
  // Access context (no direct usage needed here)
  useAuth();
  const toast = useToast();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Username availability (mock)
  useEffect(() => {
    const u = formData.username.trim();
    if (!u) { setUsernameAvailable(null); return; }
    const v = validators.username(u);
    if (!v.valid) { setUsernameAvailable(false); return; }
    setUsernameChecking(true);
    const id = setTimeout(async () => {
      try {
        const ok = await authService.checkUsernameAvailability(u);
        setUsernameAvailable(ok);
      } finally {
        setUsernameChecking(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [formData.username]);

  // Email availability and domain detection (mock)
  useEffect(() => {
    const em = formData.email.trim();
    const domain = em.includes("@") ? em.split("@")[1].toLowerCase() : "";
    setDetectedDomain(domain || null);
    if (!em || !validators.email(em)) { setEmailAvailable(null); return; }
    setEmailChecking(true);
    const id = setTimeout(async () => {
      try {
        const ok = await authService.checkEmailAvailable(em);
        setEmailAvailable(ok);
      } finally {
        setEmailChecking(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [formData.email]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!validators.username(formData.username).valid) {
      newErrors.username = validators.username(formData.username).message || "Invalid username";
    } else if (usernameAvailable === false) {
      newErrors.username = "Username already taken. Please choose another.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validators.email(formData.email)) {
      newErrors.email = "Please enter a valid university email (.edu.pk)";
    } else if (emailAvailable === false) {
      newErrors.email = "Email already in use";
    }

    const pv = validators.password(formData.password);
    if (!pv.valid) newErrors.password = pv.message || "";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!agreeTerms) newErrors.terms = "You must agree to the Terms to continue";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Real signup via Supabase (sends email if confirmations enabled)
      await authService.signUp(formData.email, formData.password, formData.username);
      toast.success("Account created! Check your email to verify.");
      // Redirect to root and show Verify page (AppRouter will handle pending verify)
      window.location.href = '/';
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner fullScreen size="lg" text="Creating your account..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 dark:from-primary/10 dark:via-accent/10 dark:to-primary/20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/25 ring-4 ring-primary/10 dark:ring-primary/30">
            <span className="text-white text-3xl font-bold">U</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">Join {APP_NAME}</h1>
          <p className="text-muted-foreground text-lg">Connect with your university community</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border p-8 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-semibold text-foreground">Username</label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="your_unique_handle"
                className="rounded-2xl h-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
              <div className="text-xs h-4">
                {usernameChecking && <span className="text-muted-foreground">Checking availability…</span>}
                {usernameAvailable === true && <span className="text-primary">Available</span>}
                {usernameAvailable === false && <span className="text-destructive">Username taken</span>}
              </div>
              {errors.username && (
                <p id="username-error" className="text-sm text-destructive mt-1 flex items-center gap-1">{errors.username}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">University Email (.edu.pk)</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.name@your-university.edu.pk"
                autoComplete="email"
                className="rounded-2xl h-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              <div className="text-xs h-4 flex items-center gap-2">
                {emailChecking && <span className="text-muted-foreground">Checking email…</span>}
                {emailAvailable === true && <span className="text-primary">Email available</span>}
                {emailAvailable === false && <span className="text-destructive">Email already in use</span>}
                {detectedDomain && <span className="text-muted-foreground">Detected: {detectedDomain}</span>}
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive mt-1 flex items-center gap-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password" 
                  autoComplete="new-password" 
                  className="rounded-2xl h-12 pr-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
              <div className="mt-1 text-xs space-y-1">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${formData.password.length >= 8 ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={formData.password.length >= 8 ? "text-primary" : "text-muted-foreground"}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${/[A-Z]/.test(formData.password) ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={/[A-Z]/.test(formData.password) ? "text-primary" : "text-muted-foreground"}>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${/[0-9]/.test(formData.password) ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={/[0-9]/.test(formData.password) ? "text-primary" : "text-muted-foreground"}>One number</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">Confirm Password</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm password"
                  className="rounded-2xl h-12 pr-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))} className="mt-1" />
              <label htmlFor="terms" className="text-sm text-foreground">
                I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
              </label>
            </div>
            {errors.terms && <p className="text-sm text-destructive -mt-1">{errors.terms}</p>}

            <Button 
              type="submit" 
              className="w-full rounded-2xl h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-lg">
            Already have an account?{" "}
            <button 
              className="text-primary hover:underline transition-colors duration-200" 
              onClick={() => window.history.back()}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
