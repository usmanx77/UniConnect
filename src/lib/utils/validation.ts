import { VALIDATION } from "../constants";

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Restrict to Pakistani university domains ending with .edu.pk
    return emailRegex.test(email) && /\.edu\.pk$/i.test(email.split("@")[1] || "");
  },

  username: (username: string): { valid: boolean; message?: string } => {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    if (!re.test(username)) {
      return {
        valid: false,
        message: "Usernames must be 3-20 characters using letters, numbers, or underscores.",
      };
    }
    return { valid: true };
  },

  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      return {
        valid: false,
        message: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`,
      };
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

