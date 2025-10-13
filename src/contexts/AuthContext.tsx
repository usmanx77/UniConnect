import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AuthState, User, LoginCredentials, OnboardingData } from "../types";
import { authService } from "../lib/services/authService";
import { supabase } from "../lib/supabaseClient";
import { STORAGE_KEYS } from "../lib/constants";

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isEmailVerified: false,
    isOnboarded: false,
    user: null,
    isLoading: true,
    error: null,
  });

  const getFromStorages = (key: string): string | null => {
    try {
      const fromSession = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
      if (fromSession) return fromSession;
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  };

  const getActiveStorage = (): Storage => {
    try {
      if (typeof window === 'undefined') return localStorage;
      const hasSessionToken = !!sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return hasSessionToken ? sessionStorage : localStorage;
    } catch {
      return localStorage;
    }
  };

  // Initialize auth state from Supabase session (fallback to storage)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        const onboardingComplete = getFromStorages(STORAGE_KEYS.ONBOARDING_COMPLETE) === "true";
        if (session?.user) {
          const sbUser = session.user;
          const name = (sbUser.user_metadata?.name || sbUser.user_metadata?.username || sbUser.email?.split("@")[0] || "User") as string;
          const user: User = {
            id: sbUser.id,
            name,
            email: sbUser.email || "",
            department: "",
            batch: "",
            bio: "",
            avatar: sbUser.user_metadata?.avatar_url || "",
            connections: 0,
            societies: 0,
          };
          setState({
            isAuthenticated: true,
            isEmailVerified: Boolean(sbUser.email_confirmed_at),
            isOnboarded: onboardingComplete,
            user,
            isLoading: false,
            error: null,
          });
        } else {
          // fallback to storage-only (e.g., pending verify flow)
          const userData = getFromStorages(STORAGE_KEYS.USER_DATA);
          const emailVerified = getFromStorages(STORAGE_KEYS.EMAIL_VERIFIED) === "true";
          if (userData) {
            const user = JSON.parse(userData);
            setState({
              isAuthenticated: false,
              isEmailVerified: emailVerified,
              isOnboarded: onboardingComplete,
              user,
              isLoading: false,
              error: null,
            });
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      const sbUser = session?.user;
      if (sbUser) {
        const name = (sbUser.user_metadata?.name || sbUser.user_metadata?.username || sbUser.email?.split("@")[0] || "User") as string;
        const user: User = {
          id: sbUser.id,
          name,
          email: sbUser.email || "",
          department: "",
          batch: "",
          bio: "",
          avatar: sbUser.user_metadata?.avatar_url || "",
          connections: 0,
          societies: 0,
        };
        // Preserve onboarding completion status from storage
        const onboardingComplete = getFromStorages(STORAGE_KEYS.ONBOARDING_COMPLETE) === "true";
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          isEmailVerified: Boolean(sbUser.email_confirmed_at),
          isOnboarded: onboardingComplete,
          user,
        }));
      } else {
        setState(prev => ({ ...prev, isAuthenticated: false, isEmailVerified: false, isOnboarded: false, user: null }));
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, token } = await authService.login(credentials);
      // Decide persistence based on saved preference
      const persistPref = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_PERSIST) : null) || 'local';
      const storage: Storage = persistPref === 'session' ? sessionStorage : localStorage;
      // Clear from the other storage to avoid stale data
      try {
        const other = persistPref === 'session' ? localStorage : sessionStorage;
        other.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        other.removeItem(STORAGE_KEYS.USER_DATA);
        other.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      } catch (error) {
        console.error("Failed to clear persisted auth data:", error);
      }
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      // derive verification status from Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      const verified = Boolean(sessionData.session?.user?.email_confirmed_at);
      const onboardingComplete = getFromStorages(STORAGE_KEYS.ONBOARDING_COMPLETE) === "true";
      setState({
        isAuthenticated: true,
        isEmailVerified: verified,
        isOnboarded: onboardingComplete,
        user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
      throw error;
    }
  };

  const signup = async (credentials: LoginCredentials & { username?: string }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Use direct service method which sets pending verify flags
      await authService.signUp(credentials.email, credentials.password, credentials.username);
      // Create a minimal user object until verification/login establishes session
      const tempUser: User = {
        id: "",
        name: credentials.username || credentials.email.split("@")[0],
        email: credentials.email,
        department: "",
        batch: "",
        bio: "",
        avatar: "",
        connections: 0,
        societies: 0,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(tempUser));
        localStorage.setItem(STORAGE_KEYS.EMAIL_VERIFIED, "false");
      } catch {}
      setState({
        isAuthenticated: false,
        isEmailVerified: false,
        isOnboarded: false,
        user: tempUser,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      let errorMessage = "Signup failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message; // Use the mapped message from authService
        }
      }
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
      
      try {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      } catch (error) {
        console.error("Failed to clear auth storage during logout:", error);
      }
      
      setState({
        isAuthenticated: false,
        isEmailVerified: false,
        isOnboarded: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedUser = await authService.completeOnboarding(data);
      const storage = getActiveStorage();
      storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
      storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        isOnboarded: true,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Onboarding failed",
      }));
      throw error;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!state.user) return;
    
    const updatedUser = { ...state.user, ...updates };
    const storage = getActiveStorage();
    storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  const value: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
    completeOnboarding,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
