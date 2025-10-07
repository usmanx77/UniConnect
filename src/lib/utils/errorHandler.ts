import { ERROR_MESSAGES, isDevelopment } from "../constants";

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.message;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
}

export function logError(error: unknown, context?: string) {
  if (isDevelopment) {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
  }

  // In production, send to logging service
  // Example: Sentry, LogRocket, etc.
  // if (isProduction) {
  //   Sentry.captureException(error, { tags: { context } });
  // }
}
