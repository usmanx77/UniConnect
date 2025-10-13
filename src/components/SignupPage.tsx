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

    // Real-time validation
    if (field === 'email' && value) {
      const validation = validators.email(value);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, email: validation.message || "" }));
      }
    } else if (field === 'username' && value) {
      const validation = validators.username(value);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, username: validation.message || "" }));
      }
    } else if (field === 'password' && value) {
      const validation = validators.password(value);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, password: validation.message || "" }));
      }
    }
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
      newErrors.username = "Username required!";
    } else if (!validators.username(formData.username).valid) {
      newErrors.username = validators.username(formData.username).message || "Invalid username";
    } else if (usernameAvailable === false) {
      newErrors.username = "Username taken!";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email required!";
    } else {
      const emailValidation = validators.email(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.message || "Invalid email";
      } else if (emailAvailable === false) {
        newErrors.email = "Email in use!";
      }
    }


    const pv = validators.password(formData.password);
    if (!pv.valid) newErrors.password = pv.message || "";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password!";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match!";

    if (!agreeTerms) newErrors.terms = "Agree to terms!";

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
      let msg = "Signup failed!";
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          msg = "Network error!";
        } else {
          msg = err.message;
        }
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }

  };

  if (isSubmitting) {
    return <LoadingSpinner fullScreen size="lg" text="Creating your account..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-brand text-primary mb-3">{APP_NAME}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Join your university community</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-8 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-bold text-slate-700 dark:text-slate-300">Username</label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="your_unique_handle"
                className={`rounded-2xl h-12 border-2 transition-all duration-300 ${
                  errors.username
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : formData.username && !errors.username && usernameAvailable === true
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                    : "border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary/20"
                }`}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
              <div className="text-xs h-4">
                {usernameChecking && <span className="text-slate-500 dark:text-slate-400">Checking availability…</span>}
                {usernameAvailable === true && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <span className="text-green-700 dark:text-green-300 font-semibold text-xs">✓ Available</span>
                  </div>
                )}
                {usernameAvailable === false && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <span className="text-red-700 dark:text-red-300 font-semibold text-xs">✗ Username taken</span>
                  </div>
                )}
              </div>
              {errors.username && (
                <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p id="username-error" className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300">University Email (.edu.pk)</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.name@your-university.edu.pk"
                autoComplete="email"
                className={`rounded-2xl h-12 border-2 transition-all duration-300 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : formData.email && !errors.email && emailAvailable === true
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                    : "border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary/20"
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              <div className="text-xs h-4 flex items-center gap-2">
                {emailChecking && <span className="text-slate-500 dark:text-slate-400">Checking email…</span>}
                {emailAvailable === true && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <span className="text-green-700 dark:text-green-300 font-semibold text-xs">✓ Email available</span>
                  </div>
                )}
                {emailAvailable === false && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <span className="text-red-700 dark:text-red-300 font-semibold text-xs">✗ Email already in use</span>
                  </div>
                )}
                {detectedDomain && <span className="text-blue-600 dark:text-blue-400 font-medium">📍 {detectedDomain}</span>}
              </div>
              {errors.email && (
                <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p id="email-error" className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className={`rounded-2xl h-12 pr-12 border-2 transition-all duration-300 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : formData.password && !errors.password
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                      : "border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary/20"
                  }`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p id="password-error" className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                </div>
              )}
              <div className="mt-2 text-xs space-y-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${formData.password.length >= 8 ? "text-green-500" : "text-slate-400"}`} />
                  <span className={formData.password.length >= 8 ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-slate-400"}`} />
                  <span className={/[A-Z]/.test(formData.password) ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${/[0-9]/.test(formData.password) ? "text-green-500" : "text-slate-400"}`} />
                  <span className={/[0-9]/.test(formData.password) ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}>One number</span>
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
                <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p id="confirmPassword-error" className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold">
                    <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))} className="mt-1" />
              <label htmlFor="terms" className="text-sm text-foreground">
                I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
              </label>
            </div>
            {errors.terms && (
              <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.terms}
                  </p>
                </div>
              )}

            <Button
              type="submit"
              className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary hover:border-primary/80"
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
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            Already have an account?{" "}
            <button
              className="text-primary hover:text-primary/80 font-bold underline transition-colors duration-200"
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
