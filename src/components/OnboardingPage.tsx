import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { CheckCircle2, ArrowLeft, ArrowRight, User, GraduationCap, Heart, Camera, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";
import { SESSIONS, YEARS, DEPARTMENTS, APP_NAME, SOCIETY_CATEGORIES } from "../lib/constants";

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    department: "",
    batch: "",
    session: "",
    year: "",
    bio: "",
    interests: [] as string[],
    societies: [] as string[],
    avatar: "",
  });
  const { completeOnboarding, isLoading } = useAuth();
  const toast = useToast();

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.session && formData.year;
      case 2: return formData.department;
      case 3: return formData.bio.length >= 10;
      case 4: return formData.interests.length >= 2 && formData.interests.length <= 5;
      case 5: return true;
      default: return false;
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding({
        department: formData.department,
        session: formData.session,
        year: formData.year,
        batch: `${formData.session} ${formData.year}`,
        interests: formData.interests,
      });
    } catch {
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Setting up your profile..." />;
  }

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return <GraduationCap className="w-5 h-5" />;
      case 2: return <User className="w-5 h-5" />;
      case 3: return <Heart className="w-5 h-5" />;
      case 4: return <Sparkles className="w-5 h-5" />;
      case 5: return <Camera className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getStepTitle = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return "Select Your Batch";
      case 2: return "Department";
      case 3: return "Tell us about yourself";
      case 4: return "Your interests";
      case 5: return "Profile setup";
      default: return "Welcome!";
    }
  };

  const getStepDescription = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return "Which batch are you from?";
      case 2: return "Which department are you in?";
      case 3: return "Share a bit about yourself";
      case 4: return "Select up to 5 interests";
      case 5: return "Almost done! Let's finish your profile";
      default: return "You're all set!";
    }
  };

  if (step === 6) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
        
        <div className="w-full max-w-md text-center relative z-10">
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border p-8">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/25 ring-4 ring-primary/20">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-primary">Welcome to {APP_NAME}!</h2>
            <div className="space-y-2 mb-8">
              <p className="text-lg text-muted-foreground">
                You&apos;re all set, <span className="font-semibold text-primary">{formData.batch}</span>
              </p>
              <p className="text-lg text-muted-foreground">{formData.department}</p>
            </div>
            <Button 
              onClick={handleComplete} 
              className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 border-2 border-primary hover:border-primary/80" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Setting up...
                </div>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
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
          <h2 className="text-3xl font-bold mb-3 text-primary">Complete Your Profile</h2>
          <p className="text-muted-foreground text-lg">Help us personalize your experience</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-8 relative">
          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                  step > i + 1
                    ? "bg-primary shadow-lg shadow-primary/30"
                    : step === i + 1
                    ? "bg-primary/70 shadow-md shadow-primary/20"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="w-8 h-8 text-primary">
                {getStepIcon(step)}
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-primary">{getStepTitle(step)}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">{getStepDescription(step)}</p>
          </div>

          {/* Step content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-foreground mb-2">Select Your Session</label>
                  <Select value={formData.session} onValueChange={(value) => handleInputChange("session", value)}>
                    <SelectTrigger className="w-full rounded-2xl h-14 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 text-lg">
                      <SelectValue placeholder="Choose your session..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-border shadow-xl">
                      {SESSIONS.map((s) => (
                        <SelectItem key={s} value={s} className="text-lg py-3">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-foreground mb-2">Select Your Year</label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                    <SelectTrigger className="w-full rounded-2xl h-14 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 text-lg">
                      <SelectValue placeholder="Choose your year..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-border shadow-xl">
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y} className="text-lg py-3">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-foreground">Select Your Department</label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger className="w-full rounded-2xl h-14 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 text-lg">
                    <SelectValue placeholder="Choose your department..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-border shadow-xl">
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d} className="text-lg py-3">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-foreground">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself, your goals, hobbies, or anything you'd like to share..."
                  className="rounded-2xl min-h-[120px] resize-none border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-300 text-lg p-4"
                />
                <div className="flex justify-between items-center text-sm">
                  <p className="text-muted-foreground">
                    {formData.bio.length}/160 characters (minimum 10)
                  </p>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.bio.length >= 10 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {formData.bio.length >= 10 ? "✓ Valid" : "Too short"}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-foreground mb-2">Select Your Interests</label>
                  <p className="text-muted-foreground text-lg">Choose at least 2 interests</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SOCIETY_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleInterest(category)}
                      className={`p-4 rounded-2xl border-2 text-lg font-semibold transition-all duration-300 ${
                        formData.interests.includes(category)
                          ? "border-primary bg-gradient-to-br from-primary/5 to-accent/5 text-primary shadow-lg shadow-primary/20"
                          : "border-border hover:border-primary hover:bg-accent text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    formData.interests.length >= 2 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <span>{formData.interests.length} selected</span>
                    {formData.interests.length >= 2 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 flex items-center justify-center mx-auto shadow-lg">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-foreground">Profile Picture</h4>
                  <p className="text-muted-foreground text-lg mb-6">
                    You can add a profile picture later in settings
                  </p>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-12 px-8 border-2 border-border hover:border-primary hover:bg-accent font-semibold"
                  >
                    Upload Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 rounded-2xl h-14 border-2 border-border hover:border-primary hover:bg-accent font-semibold"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={step === totalSteps ? () => setStep(6) : handleNext}
                disabled={!canProceed()}
                className={`${step === 1 ? "w-full" : "flex-1"} rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary hover:border-primary/80`}
              >
                {step === totalSteps ? "Review" : "Continue"}
                {step < totalSteps && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
