import { toast as sonnerToast } from "sonner@2.0.3";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../lib/constants";

export function useToast() {
  const success = (message: string) => {
    sonnerToast.success(message);
  };

  const error = (message: string) => {
    sonnerToast.error(message);
  };

  const info = (message: string) => {
    sonnerToast.info(message);
  };

  const loading = (message: string) => {
    return sonnerToast.loading(message);
  };

  const dismiss = (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  };

  return {
    success,
    error,
    info,
    loading,
    dismiss,
    messages: {
      success: SUCCESS_MESSAGES,
      error: ERROR_MESSAGES,
    },
  };
}
