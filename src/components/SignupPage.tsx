import { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Sparkle } from "lucide-react";
import { APP_NAME } from "../lib/constants";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { PAKISTANI_UNIVERSITIES } from "../lib/constants";
import { Checkbox } from "./ui/checkbox";

export function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    universityDomain: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { signup } = useAuth();
  const toast = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validators.email(formData.email)) {
      newErrors.email = "Please enter a valid university email (.edu.pk)";
    }
    
    if (!formData.university.trim()) {
      newErrors.university = "University is required";
    }
    if (!formData.universityDomain.trim()) {
      newErrors.university = "Please select your university";
    }

    // If a university domain is selected, ensure email matches it
    if (formData.universityDomain && formData.email) {
      const emailDomain = (formData.email.split("@")[1] || "").toLowerCase();
      if (!emailDomain.endsWith(formData.universityDomain.toLowerCase())) {
        newErrors.email = `Please use your ${formData.universityDomain} email`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    const passwordValidation = validators.password(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message || "";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    if (!agreeTerms) {
      setErrors(prev => ({ ...prev, terms: "You must agree to the Terms to continue" }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signup({ email: formData.email, password: formData.password });
      toast.success(`Account created successfully! Welcome to ${APP_NAME}!`);
    } catch {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner fullScreen size="lg" text="Creating your account..." />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(107,114,255,0.12),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,0.16),transparent_55%),linear-gradient(180deg,rgba(246,249,255,0.92)_0%,rgba(233,240,255,0.76)_55%,rgba(240,245,255,0.98)_100%)] px-4 py-12 dark:bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.28),transparent_55%),linear-gradient(180deg,rgba(5,7,15,0.94)_0%,rgba(5,7,15,0.96)_55%,rgba(5,7,15,0.98)_100%)]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/40 via-accent/40 to-purple-400/35 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-[-200px] right-[-140px] h-[460px] w-[460px] rounded-full bg-gradient-to-tr from-sky-200/60 via-primary/55 to-purple-400/40 blur-[110px] dark:from-sky-500/20 dark:via-primary/30 dark:to-purple-500/25" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-8 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground shadow-[0_18px_45px_-30px_rgba(15,23,42,0.5)] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-muted-foreground/80">
              <Sparkle className="h-4 w-4 text-primary" /> Begin Your Journey
            </span>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted-foreground/70">Join</p>
              <h1 className="font-logo text-5xl text-foreground drop-shadow-sm sm:text-6xl">{APP_NAME}</h1>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground/90 lg:mx-0">
                Two thoughtful steps to unlock a curated campus identity, connect with societies, and access the luxury lounge built for ambitious students.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[{ step: 1, title: "Profile Basics", description: "Share who you are and verify your .edu.pk email." }, { step: 2, title: "Secure Access", description: "Create a password and agree to our shared standards." }].map(item => (
                <div
                  key={item.step}
                  className={`flex items-start gap-3 rounded-2xl border border-white/60 px-5 py-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur transition-all duration-300 dark:border-white/10 dark:bg-white/5 ${step === item.step ? "bg-white/80 dark:bg-white/10" : "bg-white/60 dark:bg-white/0"}`}
                >
                  <div className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${step === item.step ? "bg-gradient-to-r from-primary to-purple-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {item.step}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground/95 dark:text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground/80">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_40px_80px_-45px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="border-b border-white/60 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent px-8 py-6 dark:border-white/10 dark:from-primary/20 dark:via-primary/10">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Step {step} of 2</span>
                  <h2 className="text-2xl font-semibold text-foreground">{step === 1 ? "Tell us about you" : "Secure your access"}</h2>
                  <p className="text-sm text-muted-foreground">{step === 1 ? "Introduce yourself with your verified university identity." : "Protect your space with a strong password."}</p>
                </div>
              </div>

              <div className="px-8 py-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= 1 ? "bg-gradient-to-r from-primary to-purple-500 shadow-[0_8px_20px_-10px_rgba(99,102,241,0.65)]" : "bg-muted"}`}></div>
                  <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= 2 ? "bg-gradient-to-r from-primary to-purple-500 shadow-[0_8px_20px_-10px_rgba(99,102,241,0.65)]" : "bg-muted"}`}></div>
                </div>

                {step === 1 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-semibold text-foreground">First Name</label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Ayesha"
                          className="h-12 rounded-2xl border-2 border-border bg-input-background/60 transition-all duration-300 focus:border-primary focus:ring-primary/20"
                          aria-invalid={!!errors.firstName}
                          aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        />
                        {errors.firstName && (
                          <p id="firstName-error" className="mt-1 flex items-center gap-1 text-sm text-destructive">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-semibold text-foreground">Last Name</label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Khan"
                          className="h-12 rounded-2xl border-2 border-border bg-input-background/60 transition-all duration-300 focus:border-primary focus:ring-primary/20"
                          aria-invalid={!!errors.lastName}
                          aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        />
                        {errors.lastName && (
                          <p id="lastName-error" className="mt-1 flex items-center gap-1 text-sm text-destructive">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-foreground">University Email</label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder={formData.universityDomain ? `your.name@${formData.universityDomain}` : "your.name@your-university.edu.pk"}
                        className="h-12 rounded-2xl border-2 border-border bg-input-background/60 transition-all duration-300 focus:border-primary focus:ring-primary/20"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 flex items-center gap-1 text-sm text-destructive">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">Select University (Pakistan)</label>
                      <Select
                        value={formData.universityDomain || undefined}
                        onValueChange={(value) => {
                          const selected = PAKISTANI_UNIVERSITIES.find(u => u.domain === value);
                          setFormData(prev => ({
                            ...prev,
                            university: selected?.name || "",
                            universityDomain: value,
                            email: prev.email && prev.email.includes("@")
                              ? prev.email.split("@")[0] + "@" + value
                              : prev.email,
                          }));
                          if (errors.university) setErrors(prev => ({ ...prev, university: "" }));
                          if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                        }}
                      >
                        <SelectTrigger className="h-12 rounded-2xl border-2 border-border bg-input-background/60 transition-all duration-300 focus:border-primary focus:ring-primary/20">
                          <SelectValue placeholder="Choose your university" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAKISTANI_UNIVERSITIES.map(u => (
                            <SelectItem key={u.domain} value={u.domain}>
                              {u.name} ({u.domain})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.university && (
                        <p id="university-error" className="mt-1 flex items-center gap-1 text-sm text-destructive">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.university}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Use your official .edu.pk address to keep the lounge exclusive.</p>
                    </div>

                    <Button
                      onClick={handleNext}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-purple-500 text-lg font-semibold text-white shadow-[0_24px_55px_-30px_rgba(37,99,235,0.8)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.university}
                    >
                      Continue to security
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-foreground">Password</label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder="••••••••"
                          className="h-12 rounded-2xl border-2 border-border bg-input-background/60 pr-12 transition-all duration-300 focus:border-primary focus:ring-primary/20"
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

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">Confirm Password</label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          placeholder="••••••••"
                          className="h-12 rounded-2xl border-2 border-border bg-input-background/60 pr-12 transition-all duration-300 focus:border-primary focus:ring-primary/20"
                          aria-invalid={!!errors.confirmPassword}
                          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p id="confirmPassword-error" className="mt-2 flex items-center gap-1 text-sm text-destructive">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                      <p className="mb-3 text-sm font-medium text-foreground">Password requirements</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={`h-4 w-4 ${formData.password.length >= 8 ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={formData.password.length >= 8 ? "text-primary" : "text-muted-foreground"}>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={`h-4 w-4 ${/[A-Z]/.test(formData.password) ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={/[A-Z]/.test(formData.password) ? "text-primary" : "text-muted-foreground"}>One uppercase letter</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={`h-4 w-4 ${/[0-9]/.test(formData.password) ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={/[0-9]/.test(formData.password) ? "text-primary" : "text-muted-foreground"}>One number</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={handleBack}
                        variant="outline"
                        className="h-14 flex-1 rounded-2xl border-2 border-border bg-white/60 text-sm font-semibold transition-all duration-300 hover:border-primary hover:bg-accent"
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" /> Back
                      </Button>
                      <Button
                        type="submit"
                        className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-purple-500 text-lg font-semibold text-white shadow-[0_28px_55px_-30px_rgba(37,99,235,0.85)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                        disabled={!formData.password || !formData.confirmPassword}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
                            Creating...
                          </div>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={agreeTerms}
                        onCheckedChange={checked => setAgreeTerms(Boolean(checked))}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
                      </label>
                    </div>
                    {errors.terms && <p className="-mt-1 text-sm text-destructive">{errors.terms}</p>}
                  </form>
                )}
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already with us?
              <button className="ml-2 text-primary hover:underline" onClick={() => window.history.back()}>
                Sign in to continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}