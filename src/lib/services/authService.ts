import type { User, LoginCredentials, OnboardingData } from "../../types";
import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from "../constants";
import { supabase } from "../supabaseClient";

// Mock delay to simulate API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
  private baseUrl = API_CONFIG.BASE_URL;

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    if (error || !data.session || !data.user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    const sbUser = data.user;
    const token = data.session.access_token;
    const name = sbUser.user_metadata?.name || sbUser.user_metadata?.username || sbUser.email?.split("@")[0] || "User";
    const user: User = {
      id: sbUser.id,
      name,
      email: sbUser.email || credentials.email,
      department: "",
      batch: "",
      bio: "",
      avatar: sbUser.user_metadata?.avatar_url || "",
      connections: 0,
      societies: 0,
    };
    try {
      const verified = Boolean(sbUser.email_confirmed_at);
      const storage = localStorage;
      storage.setItem(STORAGE_KEYS.EMAIL_VERIFIED, verified ? "true" : "false");
      storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({ email: user.email }));
    } catch {}
    return { user, token };
  }

  async signUp(email: string, password: string, username?: string): Promise<void> {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username },
        emailRedirectTo: redirectTo,
      },
    });
    if (error) {
      // Surface the exact Supabase message (e.g., invalid_redirect_url, user already registered)
      throw new Error(error.message || ERROR_MESSAGES.AUTH_FAILED);
    }
    // Log helpful context for debugging 422s during dev
    try { console.debug('[signUp]', { redirectTo, userId: data?.user?.id }); } catch {}
    try {
      localStorage.setItem(STORAGE_KEYS.EMAIL_VERIFIED, "false");
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({ email }));
    } catch {}
  }

  // Check username availability against DB (profiles.username)
  async checkUsernameAvailability(username: string): Promise<boolean> {
    const u = username.trim();
    if (!u) return false;
    // Fast-fail client validation same as DB CHECK
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(u)) return false;

    // Case-insensitive exact match using ILIKE without wildcards
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .ilike('username', u);
    if (error) {
      // On error, be conservative and say unavailable to avoid collisions
      return false;
    }
    return (count ?? 0) === 0;
  }

  async checkEmailAvailable(email: string): Promise<boolean> {
    const em = email.trim().toLowerCase();
    // Basic format and domain check first
    if (!em || !em.endsWith('.edu.pk')) return false;
    // Check against profiles.email (best-effort preflight)
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .ilike('email', em);
    if (error) {
      // If the check fails, fall back to allowing submit and let signUp enforce uniqueness
      return true;
    }
    return (count ?? 0) === 0;
  }

  async sendVerificationEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    if (error) throw error;
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async completeOnboarding(data: OnboardingData): Promise<User> {
    // Resolve current Supabase user
    const { data: u } = await supabase.auth.getUser();
    const sbUser = u.user;
    if (!sbUser || !sbUser.email) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Determine university_id from email domain
    const domain = (sbUser.email.split('@')[1] || '').toLowerCase();
    const { data: domainRow, error: domainErr } = await supabase
      .from('university_domains')
      .select('university_id')
      .eq('domain', domain)
      .single();
    if (domainErr || !domainRow) {
      throw new Error('Your email domain is not allowed.');
    }

    const name = (sbUser.user_metadata?.name || sbUser.user_metadata?.username || sbUser.email.split('@')[0] || 'User') as string;

    // Upsert profile
    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert({
        id: sbUser.id,
        university_id: domainRow.university_id,
        name,
        email: sbUser.email,
        department: data.department,
        batch: data.batch,
        username: (sbUser.user_metadata?.username as string | undefined) || null,
      }, { onConflict: 'id' });
    if (upsertErr) {
      throw upsertErr;
    }

    // Update local representation and storage
    const updatedUser: User = {
      id: sbUser.id,
      name,
      email: sbUser.email,
      department: data.department,
      batch: data.batch,
      bio: '',
      avatar: sbUser.user_metadata?.avatar_url || '',
      connections: 0,
      societies: 0,
    };
    try {
      const storage = localStorage;
      storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    } catch {}

    return updatedUser;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    await delay(800);

    const raw = (() => {
      try {
        const fromSession = sessionStorage.getItem("uniconnect_user_data");
        if (fromSession) return fromSession;
        return localStorage.getItem("uniconnect_user_data");
      } catch {
        return null;
      }
    })();
    if (!raw) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const user = JSON.parse(raw) as User;
    const updatedUser = { ...user, ...updates };

    return updatedUser;
  }

  async verifyToken(token: string): Promise<boolean> {
    await delay(300);
    // Mock token verification
    return token.startsWith("mock-jwt-token");
  }

  async requestPasswordReset(email: string): Promise<void> {
    const em = email.trim();
    if (!em.toLowerCase().endsWith('.edu.pk')) {
      throw new Error('Please use your official .edu.pk university email address');
    }
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(em, { redirectTo });
    if (error) throw new Error(error.message || ERROR_MESSAGES.AUTH_FAILED);
  }
}

export const authService = new AuthService();
