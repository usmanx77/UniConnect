import { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { validators } from "../lib/utils/validation";
import { LoadingSpinner } from "./LoadingSpinner";
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { APP_NAME } from "../lib/constants";

export function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
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
      newErrors.email = "Please enter a valid university email (.edu)";
    }
    
    if (!formData.university.trim()) {
      newErrors.university = "University name is required";
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
    
    setIsSubmitting(true);
    
    try {
      // Simulate signup process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Auto-login after successful signup
      await login({
        email: formData.email,
        password: formData.password,
      });
      
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
      // Simulate Google OAuth signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      await login({
        email: "student@university.edu",
        password: "password123",
      });
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 dark:from-primary/10 dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-white text-2xl">U</span>
          </div>
          <h1 className="mb-2">Join {APP_NAME}</h1>
          <p className="text-muted-foreground">Connect with your university community</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
                <p className="text-sm text-muted-foreground">Tell us about yourself</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block mb-2 text-sm">First Name</label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="John"
                    className="rounded-xl h-11"
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-xs text-destructive mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block mb-2 text-sm">Last Name</label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Doe"
                    className="rounded-xl h-11"
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="text-xs text-destructive mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm">University Email</label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john.doe@university.edu"
                  className="rounded-xl h-11"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="university" className="block mb-2 text-sm">University Name</label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                  placeholder="University of Technology"
                  className="rounded-xl h-11"
                  aria-invalid={!!errors.university}
                  aria-describedby={errors.university ? "university-error" : undefined}
                />
                {errors.university && (
                  <p id="university-error" className="text-xs text-destructive mt-1">{errors.university}</p>
                )}
              </div>

              <Button
                onClick={handleNext}
                className="w-full rounded-xl h-11"
                disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.university}
              >
                Continue
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Create Password</h2>
                <p className="text-sm text-muted-foreground">Choose a secure password</p>
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl h-11 pr-10"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive mt-1">{errors.password}</p>
                )}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className={`w-3 h-3 ${formData.password.length >= 8 ? "text-green-500" : "text-muted-foreground"}`} />
                    At least 8 characters
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`} />
                    One uppercase letter
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className={`w-3 h-3 ${/[0-9]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`} />
                    One number
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-2 text-sm">Confirm Password</label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl h-11 pr-10"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl h-11"
                  disabled={!formData.password || !formData.confirmPassword}
                >
                  Create Account
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">or continue with</span>
                </div>
              </div>

              <Button
                className="w-full rounded-xl mb-6 h-12 shadow-sm"
                onClick={handleGoogleSignup}
                disabled={isSubmitting}
                variant="outline"
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
                Sign up with Google
              </Button>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button 
              className="text-primary hover:underline"
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