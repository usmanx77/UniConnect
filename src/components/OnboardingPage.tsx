import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { LoadingSpinner } from "./LoadingSpinner";
import { BATCHES, DEPARTMENTS, APP_NAME } from "../lib/constants";

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const { completeOnboarding, isLoading } = useAuth();
  const toast = useToast();

  const handleNext = () => {
    if (step === 1 && batch) setStep(2);
    else if (step === 2 && department) setStep(3);
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding({
        department,
        batch,
        interests: [],
      });
    } catch {
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Setting up your profile..." />;
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50 dark:from-primary/10 dark:via-purple-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="mb-3">Welcome to {APP_NAME}!</h2>
            <p className="text-muted-foreground mb-2">
              You&apos;re all set, {batch}
            </p>
            <p className="text-muted-foreground mb-8">{department}</p>
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
          <h2 className="mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground">Help us personalize your experience</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block mb-3">Select Your Batch</label>
                <Select value={batch} onValueChange={setBatch}>
                  <SelectTrigger className="w-full rounded-xl h-12">
                    <SelectValue placeholder="Choose batch..." />
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
              <Button
                onClick={handleNext}
                disabled={!batch}
                className="w-full rounded-xl h-11"
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block mb-3">Select Your Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-full rounded-xl h-12">
                    <SelectValue placeholder="Choose department..." />
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
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!department}
                  className="flex-1 rounded-xl h-11"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
