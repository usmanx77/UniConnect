import { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { APP_NAME } from "../lib/constants";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { PAKISTANI_UNIVERSITIES } from "../lib/constants";
import { Checkbox } from "./ui/checkbox";
import { authService } from "../lib/services/authService";

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
      toast.success("Account created successfully! Welcome to UniConnect!");
    } catch {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      await authService.loginWithOAuth("google");
      toast.success("Account created successfully with Google!");
    } catch {
      toast.error("Failed to sign up with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner fullScreen size="lg" text="Creating your account..." />;
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">Join {APP_NAME}</h1>
          <p className="text-muted-foreground text-lg">Connect with your university community</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border p-8 relative">
          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex-1 h-3 rounded-full transition-all duration-500 ${step >= 1 ? "bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30" : "bg-muted"}`}></div>
            <div className={`flex-1 h-3 rounded-full transition-all duration-500 ${step >= 2 ? "bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30" : "bg-muted"}`}></div>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Personal Information</h2>
                <p className="text-muted-foreground text-lg">Tell us about yourself</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-foreground">First Name</label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="John"
                    className="rounded-2xl h-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                    placeholder="Doe"
                    className="rounded-2xl h-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                  placeholder={formData.universityDomain ? `john.doe@${formData.universityDomain}` : "john.doe@your-university.edu.pk"}
                  className="rounded-2xl h-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                  <SelectTrigger className="rounded-2xl h-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300">
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
                  <p id="university-error" className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.university}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Only official .edu.pk emails are accepted.</p>
              </div>

              <Button
                onClick={handleNext}
                className="w-full rounded-2xl h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.university}
              >
                Continue
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Create Password</h2>
                <p className="text-muted-foreground text-lg">Choose a secure password</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="rounded-2xl h-12 pr-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
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
                <div className="mt-4 p-4 bg-muted rounded-2xl space-y-2">
                  <p className="text-sm font-medium text-foreground mb-3">Password requirements:</p>
                  <div className="space-y-2">
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
                    className="rounded-2xl h-12 pr-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-destructive mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 rounded-2xl h-14 border-2 border-border hover:border-primary hover:bg-accent font-semibold"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-2xl h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.password || !formData.confirmPassword}
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
              </div>
              <div className="flex items-start gap-3 -mt-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-foreground">
                  I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive -mt-1">{errors.terms}</p>
              )}

            </form>
          )}

          {step === 1 && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-200 dark:border-purple-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">or continue with</span>
                </div>
              </div>

              <Button
                className="w-full rounded-2xl mb-6 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-card hover:bg-accent text-foreground border-2 border-border hover:border-primary/40 font-semibold"
                onClick={handleGoogleSignup}
                disabled={isSubmitting}
                variant="outline"
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
            </>
          )}

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
    </div>
  );
}