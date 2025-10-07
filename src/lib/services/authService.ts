import type { User, LoginCredentials, OnboardingData } from "../../types";
import { API_CONFIG, ERROR_MESSAGES } from "../constants";

// Mock delay to simulate API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
  private baseUrl = API_CONFIG.BASE_URL;

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    await delay(1000); // Simulate network delay

    // Mock validation
    if (!credentials.email.toLowerCase().endsWith(".edu.pk")) {
      throw new Error("Please use your official .edu.pk university email address");
    }

    // Mock user data
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

  async logout(): Promise<void> {
    await delay(500);
    // In a real app, this would invalidate the token on the server
  }

  async completeOnboarding(data: OnboardingData): Promise<User> {
    await delay(800);

    // Get current user from storage (in real app, would be from API)
    const userData = localStorage.getItem("uniconnect_user_data");
    if (!userData) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const user = JSON.parse(userData) as User;

    // Update user with onboarding data
    const updatedUser: User = {
      ...user,
      department: data.department,
      batch: data.batch,
    };

    return updatedUser;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    await delay(800);

    const userData = localStorage.getItem("uniconnect_user_data");
    if (!userData) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const user = JSON.parse(userData) as User;
    const updatedUser = { ...user, ...updates };

    return updatedUser;
  }

  async verifyToken(token: string): Promise<boolean> {
    await delay(300);
    // Mock token verification
    return token.startsWith("mock-jwt-token");
  }

  async requestPasswordReset(email: string): Promise<void> {
    await delay(1000);
    if (!email.toLowerCase().endsWith(".edu.pk")) {
      throw new Error("Please use your official .edu.pk university email address");
    }
    // Mock password reset email
  }
}

export const authService = new AuthService();
