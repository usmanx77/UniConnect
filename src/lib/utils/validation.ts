import { VALIDATION } from "../constants";

export const validators = {
  email: (email: string): { valid: boolean; message?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domain = email.split("@")[1] || "";

    if (!email.trim()) {
      return { valid: false, message: "Email required!" };
    }

    if (!emailRegex.test(email)) {
      return { valid: false, message: "Invalid email format" };
    }

    if (!/\.edu\.pk$/i.test(domain)) {
      return { valid: false, message: "Must be .edu.pk email" };
    }


    return { valid: true };
  },

  username: (username: string): { valid: boolean; message?: string } => {
    if (!username.trim()) {
      return { valid: false, message: "Username required!" };
    }

    if (username.length < 3) {
      return { valid: false, message: "Too short (min 3 chars)" };
    }

    if (username.length > 20) {
      return { valid: false, message: "Too long (max 20 chars)" };
    }

    const re = /^[a-zA-Z0-9_]+$/;
    if (!re.test(username)) {
      return {
        valid: false,
        message: "Only letters, numbers, underscores",
      };
    }

    return { valid: true };
  },

  password: (password: string): { valid: boolean; message?: string } => {
    if (!password) {
      return { valid: false, message: "Password required!" };
    }

    if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      return {
        valid: false,
        message: `Too short (min ${VALIDATION.MIN_PASSWORD_LENGTH} chars)`,
      };
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: "Needs uppercase letter" };
    }

    if (!/[0-9]/.test(password)) {
      return { valid: false, message: "Needs a number" };
    }

    return { valid: true };
  },

  postContent: (content: string): { valid: boolean; message?: string } => {
    if (!content.trim()) {
      return { valid: false, message: "Post content cannot be empty" };
    }
    if (content.length > VALIDATION.MAX_POST_LENGTH) {
      return {
        valid: false,
        message: `Post cannot exceed ${VALIDATION.MAX_POST_LENGTH} characters`,
      };
    }
    return { valid: true };
  },

  bio: (bio: string): { valid: boolean; message?: string } => {
    if (bio.length < VALIDATION.MIN_BIO_LENGTH) {
      return {
        valid: false,
        message: `Bio must be at least ${VALIDATION.MIN_BIO_LENGTH} characters`,
      };
    }
    if (bio.length > VALIDATION.MAX_BIO_LENGTH) {
      return {
        valid: false,
        message: `Bio cannot exceed ${VALIDATION.MAX_BIO_LENGTH} characters`,
      };
    }
    return { valid: true };
  },

  imageFile: (file: File): { valid: boolean; message?: string } => {
    const normalizedType = (file.type || "").toLowerCase();
    const allowedMimeTypes = VALIDATION.ALLOWED_IMAGE_TYPES.map(type => type.toLowerCase());
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    const matchesMimeType = normalizedType ? allowedMimeTypes.includes(normalizedType) : false;
    const matchesExtension = fileExtension ? allowedExtensions.includes(fileExtension) : false;

    if (!matchesMimeType && !matchesExtension) {
      return {
        valid: false,
        message: "Please upload a JPEG, PNG, or WebP image",
      };
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > VALIDATION.MAX_IMAGE_SIZE_MB) {
      return {
        valid: false,
        message: `Image size must be less than ${VALIDATION.MAX_IMAGE_SIZE_MB}MB`,
      };
    }
    return { valid: true };
  },
};

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
