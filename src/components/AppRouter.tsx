import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { LoginPage } from "./LoginPage";
import { SignupPage } from "./SignupPage";
import { OnboardingPage } from "./OnboardingPage";
import { VerifyEmailPage } from "./VerifyEmailPage";
import { ResetPasswordPage } from "./ResetPasswordPage";
import { MainLayout } from "./layouts/MainLayout";
import { LoadingSpinner } from "./LoadingSpinner";

export function AppRouter() {
  const { isAuthenticated, isEmailVerified, isOnboarded, isLoading: authLoading } = useAuth();
  const { isLoading: appLoading } = useApp();
  // Pending email verification after signup (no session yet)
  let pendingVerify = false;
  try {
    const rawUser = localStorage.getItem('uniconnect_user_data') || sessionStorage.getItem('uniconnect_user_data');
    const emailVerified = localStorage.getItem('uniconnect_email_verified');
    pendingVerify = Boolean(rawUser) && emailVerified === 'false';
  } catch {}

  // Show loading spinner during authentication check
  if (authLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Loading..." />;
  }

  // Check if we're on special routes
  const isSignupPage = typeof window !== 'undefined' && window.location.pathname === '/signup';
  const isResetPage = typeof window !== 'undefined' && window.location.pathname === '/reset';

  // Show signup page if on signup route
  if (isSignupPage) {
    return <SignupPage />;
  }
  // Password reset route (works even if not authenticated)
  if (isResetPage) {
    return <ResetPasswordPage />;
  }

  // Show verify page even if not authenticated but pending verification
  if (!isAuthenticated && pendingVerify) {
    return <VerifyEmailPage />;
  }
  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show email verification gate before onboarding
  if (!isEmailVerified) {
    return <VerifyEmailPage />;
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
