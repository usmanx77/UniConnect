import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { LoginPage } from "./LoginPage";
import { SignupPage } from "./SignupPage";
import { OnboardingPage } from "./OnboardingPage";
import { MainLayout } from "./layouts/MainLayout";
import { LoadingSpinner } from "./LoadingSpinner";

export function AppRouter() {
  const { isAuthenticated, isOnboarded, isLoading: authLoading } = useAuth();
  const { isLoading: appLoading } = useApp();

  // Show loading spinner during authentication check
  if (authLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Loading..." />;
  }

  // Check if we're on the signup page
  const isSignupPage = typeof window !== 'undefined' && window.location.pathname === '/signup';

  // Show signup page if on signup route
  if (isSignupPage) {
    return <SignupPage />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show onboarding if not completed
  if (!isOnboarded) {
    return <OnboardingPage />;
  }

  // Show main application
  return (
    <>
      {appLoading && <LoadingSpinner fullScreen size="lg" />}
      <MainLayout />
    </>
  );
}
