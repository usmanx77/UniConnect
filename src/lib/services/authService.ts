import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User, LoginCredentials, OnboardingData } from "../../types";
import { ERROR_MESSAGES } from "../constants";
import { getSupabaseClient, isSupabaseAvailable } from "../supabaseClient";

// Mock delay to simulate API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function mapSupabaseUser(supabaseUser: SupabaseAuthUser): User {
  const email = supabaseUser.email ?? `${supabaseUser.id}@example.com`;
  const name =
    supabaseUser?.user_metadata?.full_name ||
    (email ? email.split("@")[0] : "User");
  return {
    id: supabaseUser.id,
    name,
    email,
    department: "",
    batch: "",
    bio: "",
    avatar: supabaseUser?.user_metadata?.avatar_url || "",
    connections: 0,
    societies: 0,
  };
}

class AuthService {
  async signup(credentials: LoginCredentials): Promise<{ user: User; token: string | null }> {
    if (isSupabaseAvailable()) {
      const supabase = getSupabaseClient()!;
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      const supaUser = data.user;
      const session = data.session; // can be null if email confirmation required
      if (!supaUser) throw new Error("Signup failed. Please try again.");
      return { user: mapSupabaseUser(supaUser), token: session?.access_token ?? null };
    }

    // Mock fallback
    await delay(800);
    if (!credentials.email.toLowerCase().endsWith(".edu.pk")) {
      throw new Error("Please use your official .edu.pk university email address");
    }
    const user: User = {
      id: "user-" + Date.now(),
      name: credentials.email.split("@")[0],
      email: credentials.email,
      department: "",
      batch: "",
      bio: "",
      avatar: "",
      connections: 0,
      societies: 0,
    };
    const token = "mock-jwt-token-" + Date.now();
    return { user, token };
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    if (isSupabaseAvailable()) {
      const supabase = getSupabaseClient()!;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      if (!data.user || !data.session?.access_token) {
        throw new Error("Login failed. Please try again.");
      }
      return { user: mapSupabaseUser(data.user), token: data.session.access_token };
    }

    // Mock fallback
    await delay(600);
    if (!credentials.email.toLowerCase().endsWith(".edu.pk")) {
      throw new Error("Please use your official .edu.pk university email address");
    }
    const user: User = {
      id: "user-123",
      name: "You",
      email: credentials.email,
      department: "",
      batch: "",
      bio: "",
      avatar: "",
      connections: 0,
      societies: 0,
    };
    const token = "mock-jwt-token-" + Date.now();
    return { user, token };
  }

  async loginWithOAuth(provider: "google"): Promise<void> {
    if (isSupabaseAvailable()) {
      const supabase = getSupabaseClient()!;
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
      if (error) throw error;
      return; // Redirect will occur
    }
    // Mock fallback: simulate login
    await this.login({ email: "student@nu.edu.pk", password: "password123" });
  }

  async logout(): Promise<void> {
    if (isSupabaseAvailable()) {
      const supabase = getSupabaseClient()!;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return;
    }
    await delay(300);
  }

  async completeOnboarding(data: OnboardingData): Promise<User> {
    if (isSupabaseAvailable()) {
      // Optional: update a profile table if present; fallback to local storage mirror
      const userData = localStorage.getItem("uniconnect_user_data");
      if (!userData) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const user = JSON.parse(userData) as User;
      return { ...user, department: data.department, batch: data.batch };
    }

    await delay(500);
    const userData = localStorage.getItem("uniconnect_user_data");
    if (!userData) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
    const user = JSON.parse(userData) as User;
    const updatedUser: User = { ...user, department: data.department, batch: data.batch };
    return updatedUser;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (isSupabaseAvailable()) {
      const userData = localStorage.getItem("uniconnect_user_data");
      if (!userData) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const user = JSON.parse(userData) as User;
      return { ...user, ...updates };
    }
    await delay(400);
    const userData = localStorage.getItem("uniconnect_user_data");
    if (!userData) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    const user = JSON.parse(userData) as User;
    return { ...user, ...updates };
  }

  async verifyToken(token: string): Promise<boolean> {
    if (isSupabaseAvailable()) {
      const supabase = getSupabaseClient()!;
      // A simple check: fetch current session
      const { data } = await supabase.auth.getSession();
      return Boolean(data.session?.access_token === token);
    }
    await delay(200);
    return token.startsWith("mock-jwt-token");
  }

  async requestPasswordReset(email: string): Promise<void> {
    if (isSupabaseAvailable()) {
      const supabase = getSupabaseClient()!;
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      return;
    }
    await delay(600);
    if (!email.toLowerCase().endsWith(".edu.pk")) {
      throw new Error("Please use your official .edu.pk university email address");
    }
  }
}

export const authService = new AuthService();
