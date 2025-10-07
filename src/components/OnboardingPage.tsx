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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-fuchsia-950/20 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-md text-center relative z-10">
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100/50 dark:border-purple-900/30 p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/25 ring-4 ring-green-100 dark:ring-green-900/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Welcome to {APP_NAME}!</h2>
            <div className="space-y-2 mb-8">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                You&apos;re all set, <span className="font-semibold text-purple-600 dark:text-purple-400">{formData.batch}</span>
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">{formData.department}</p>
            </div>
            <Button 
              onClick={handleComplete} 
              className="w-full rounded-2xl h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50" 
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-fuchsia-950/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25 ring-4 ring-purple-100 dark:ring-purple-900/30">
            <span className="text-white text-3xl font-bold">U</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Complete Your Profile</h2>
          <p className="text-muted-foreground text-lg">Help us personalize your experience</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100/50 dark:border-purple-900/30 p-8 relative">
          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                  step > i + 1 
                    ? "bg-gradient-to-r from-purple-500 to-violet-500 shadow-lg shadow-purple-500/30" 
                    : step === i + 1 
                    ? "bg-gradient-to-r from-purple-400 to-violet-400 shadow-md shadow-purple-400/20" 
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Step header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="w-8 h-8 text-purple-600 dark:text-purple-400">
                {getStepIcon(step)}
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{getStepTitle(step)}</h3>
            <p className="text-muted-foreground text-lg">{getStepDescription(step)}</p>
          </div>

          {/* Step content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">Select Your Batch</label>
                <Select value={formData.batch} onValueChange={(value) => handleInputChange("batch", value)}>
                  <SelectTrigger className="w-full rounded-2xl h-14 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 text-lg">
                    <SelectValue placeholder="Choose your batch..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-gray-200 shadow-xl">
                    {BATCHES.map((b) => (
                      <SelectItem key={b} value={b} className="text-lg py-3">
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">Select Your Department</label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger className="w-full rounded-2xl h-14 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 text-lg">
                    <SelectValue placeholder="Choose your department..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 border-gray-200 shadow-xl">
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
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself, your goals, hobbies, or anything you'd like to share..."
                  className="rounded-2xl min-h-[120px] resize-none border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 text-lg p-4"
                />
                <div className="flex justify-between items-center text-sm">
                  <p className="text-muted-foreground">
                    {formData.bio.length}/160 characters (minimum 10)
                  </p>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.bio.length >= 10 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {formData.bio.length >= 10 ? "✓ Valid" : "Too short"}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Your Interests</label>
                  <p className="text-muted-foreground text-lg">Choose at least 2 interests</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SOCIETY_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleInterest(category)}
                      className={`p-4 rounded-2xl border-2 text-lg font-semibold transition-all duration-300 ${
                        formData.interests.includes(category)
                          ? "border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-500/20"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/10 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    formData.interests.length >= 2 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                  }`}>
                    <span>{formData.interests.length} selected</span>
                    {formData.interests.length >= 2 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 flex items-center justify-center mx-auto shadow-lg">
                  <Camera className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-700 dark:text-gray-300">Profile Picture</h4>
                  <p className="text-muted-foreground text-lg mb-6">
                    You can add a profile picture later in settings
                  </p>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-12 px-8 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-semibold"
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
                  className="flex-1 rounded-2xl h-14 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-semibold"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={step === totalSteps ? () => setStep(6) : handleNext}
                disabled={!canProceed()}
                className={`${step === 1 ? "w-full" : "flex-1"} rounded-2xl h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
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
