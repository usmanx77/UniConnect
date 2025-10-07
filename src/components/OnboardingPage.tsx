import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { CheckCircle2, ArrowLeft, ArrowRight, User, GraduationCap, Heart, Camera, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";
import { BATCHES, DEPARTMENTS, APP_NAME, SOCIETY_CATEGORIES } from "../lib/constants";

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    batch: "",
    department: "",
    bio: "",
    interests: [] as string[],
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
      case 1: return formData.batch;
      case 2: return formData.department;
      case 3: return formData.bio.trim().length >= 10;
      case 4: return formData.interests.length >= 2;
      case 5: return true;
      default: return false;
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding({
        department: formData.department,
        batch: formData.batch,
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
      case 1: return "Academic Info";
      case 2: return "Department";
      case 3: return "Tell us about yourself";
      case 4: return "Your interests";
      case 5: return "Profile setup";
      default: return "Welcome!";
    }
  };

  const getStepDescription = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return "Let's start with your academic background";
      case 2: return "Which department are you in?";
      case 3: return "Write a short bio to introduce yourself";
      case 4: return "Select your interests to find like-minded people";
      case 5: return "Almost done! Let's set up your profile";
      default: return "You're all set!";
    }
  };

  if (step === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 dark:from-primary/10 dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Welcome to {APP_NAME}!</h2>
            <p className="text-muted-foreground mb-2">
              You&apos;re all set, {formData.batch}
            </p>
            <p className="text-muted-foreground mb-8">{formData.department}</p>
            <Button onClick={handleComplete} className="w-full rounded-xl h-11" disabled={isLoading}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 dark:from-primary/10 dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-white text-2xl">U</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground">Help us personalize your experience</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  step > i + 1 ? "bg-primary" : step === i + 1 ? "bg-primary/60" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {getStepIcon(step)}
            </div>
            <h3 className="text-xl font-semibold mb-2">{getStepTitle(step)}</h3>
            <p className="text-sm text-muted-foreground">{getStepDescription(step)}</p>
          </div>

          {/* Step content */}
          <div className="space-y-6">
            {step === 1 && (
              <div>
                <label className="block mb-3 font-medium">Select Your Batch</label>
                <Select value={formData.batch} onValueChange={(value) => handleInputChange("batch", value)}>
                  <SelectTrigger className="w-full rounded-xl h-12">
                    <SelectValue placeholder="Choose your batch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCHES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block mb-3 font-medium">Select Your Department</label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger className="w-full rounded-xl h-12">
                    <SelectValue placeholder="Choose your department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block mb-3 font-medium">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself, your goals, hobbies, or anything you'd like to share..."
                  className="rounded-xl min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.bio.length}/160 characters (minimum 10)
                </p>
              </div>
            )}

            {step === 4 && (
              <div>
                <label className="block mb-3 font-medium">Select Your Interests</label>
                <p className="text-sm text-muted-foreground mb-4">Choose at least 2 interests</p>
                <div className="grid grid-cols-2 gap-3">
                  {SOCIETY_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleInterest(category)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        formData.interests.includes(category)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.interests.length} selected
                </p>
              </div>
            )}

            {step === 5 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Profile Picture</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can add a profile picture later in settings
                  </p>
                  <Button variant="outline" className="rounded-xl">
                    Upload Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={step === totalSteps ? () => setStep(6) : handleNext}
                disabled={!canProceed()}
                className={`${step === 1 ? "w-full" : "flex-1"} rounded-xl h-11`}
              >
                {step === totalSteps ? "Review" : "Continue"}
                {step < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
