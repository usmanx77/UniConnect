import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AppState, PageRoute } from "../types";
import { STORAGE_KEYS } from "../lib/constants";

interface AppContextValue extends AppState {
  navigate: (page: PageRoute, societyId?: string) => void;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentPage: "home",
    darkMode: false,
    isLoading: false,
    error: null,
    notifications: [],
    unreadNotifications: 0,
  });

  // Initialize dark mode from storage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === "true";
      setState(prev => ({ ...prev, darkMode: isDark }));
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(state.darkMode));
  }, [state.darkMode]);

  const navigate = (page: PageRoute, societyId?: string) => {
    setState(prev => ({ 
      ...prev, 
      currentPage: page, 
      error: null,
      currentSocietyId: societyId 
    }));
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const value: AppContextValue = {
    ...state,
    navigate,
    toggleDarkMode,
    setLoading,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
