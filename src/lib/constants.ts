import type { PageRoute } from "../types";

// Environment helpers
export const isDevelopment = typeof process !== 'undefined' 
  ? process.env?.NODE_ENV === 'development' 
  : import.meta.env?.DEV ?? true;

export const isProduction = typeof process !== 'undefined'
  ? process.env?.NODE_ENV === 'production'
  : import.meta.env?.PROD ?? false;

// App Configuration
export const APP_NAME = "Campusloif";
export const APP_VERSION = "1.0.0";

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "uniconnect_auth_token",
  USER_DATA: "uniconnect_user_data",
  DARK_MODE: "uniconnect_dark_mode",
  ONBOARDING_COMPLETE: "uniconnect_onboarding_complete",
  AUTH_PERSIST: "uniconnect_auth_persist", // 'local' | 'session'
  EMAIL_VERIFIED: "uniconnect_email_verified",
} as const;

// Routes Configuration
export const ROUTES: Record<PageRoute, { id: PageRoute; label: string; icon: string }> = {
  home: { id: "home", label: "Home Feed", icon: "🏠" },
  profile: { id: "profile", label: "My Profile", icon: "👤" },
  connections: { id: "connections", label: "Circle", icon: "👥" },
  societies: { id: "societies", label: "Societies", icon: "🎓" },
  events: { id: "events", label: "Events", icon: "📅" },
  chat: { id: "chat", label: "Messages", icon: "💬" },
  bookmarks: { id: "bookmarks", label: "Bookmarks", icon: "🔖" },
  search: { id: "search", label: "Search", icon: "🔍" },
  settings: { id: "settings", label: "Settings", icon: "⚙️" },
} as const;

// Departments
export const DEPARTMENTS = [
  "Computer Science",
  "Business Administration",
  "Engineering",
  "Psychology",
  "Biology",
  "Mathematics",
  "Economics",
  "English Literature",
  "Political Science",
  "Arts & Design",
] as const;

// Batches
export const BATCHES = [
  "Fall 2023",
  "Spring 2024",
  "Fall 2024",
  "Spring 2025",
] as const;

// Society Categories
export const SOCIETY_CATEGORIES = [
  "Academic",
  "Arts",
  "Sports",
  "Technology",
  "Social",
  "Cultural",
] as const;

// API Configuration (mock)
export const API_CONFIG = {
  BASE_URL: "https://api.uniconnect.edu",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_POST_LENGTH: 500,
  MAX_COMMENT_LENGTH: 200,
  MIN_BIO_LENGTH: 10,
  MAX_BIO_LENGTH: 160,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_IMAGE_SIZE_MB: 5,
} as const;

// UI Configuration
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  INFINITE_SCROLL_THRESHOLD: 0.8,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTH_FAILED: "Authentication failed. Please try again.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  POST_CREATED: "Post created successfully!",
  CONNECTION_SENT: "Connection request sent!",
  CONNECTION_ACCEPTED: "Connection accepted!",
  SOCIETY_JOINED: "Successfully joined society!",
  EVENT_RSVP: "RSVP confirmed!",
} as const;

// Pakistani Universities (sample list)
export const PAKISTANI_UNIVERSITIES: ReadonlyArray<{ name: string; domain: string }> = [
  { name: "National University of Sciences & Technology (NUST)", domain: "nust.edu.pk" },
  { name: "FAST National University (NUCES)", domain: "nu.edu.pk" },
  { name: "Lahore University of Management Sciences (LUMS)", domain: "lums.edu.pk" },
  { name: "University of the Punjab", domain: "pu.edu.pk" },
  { name: "UET Lahore", domain: "uet.edu.pk" },
  { name: "COMSATS University Islamabad", domain: "comsats.edu.pk" },
  { name: "Quaid-i-Azam University", domain: "qau.edu.pk" },
  { name: "University of Karachi", domain: "uok.edu.pk" },
  { name: "IBA Karachi", domain: "iba.edu.pk" },
  { name: "Government College University Lahore", domain: "gcu.edu.pk" },
  { name: "NED University of Engineering & Technology", domain: "neduet.edu.pk" },
  { name: "GIKI", domain: "giki.edu.pk" },
  { name: "Minhaj University Lahore", domain: "mul.edu.pk" },
  { name: "Air University", domain: "au.edu.pk" },
  { name: "Bahria University", domain: "bahria.edu.pk" },
  { name: "UET Peshawar", domain: "uetpeshawar.edu.pk" },
  { name: "UET Taxila", domain: "uettaxila.edu.pk" },
];
