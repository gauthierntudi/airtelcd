import {
  toast,
  type ToastOptions,
  type ToastPromiseParams,
} from "react-toastify";

const MAX_TOAST_CHARS = 48;

const DEFAULT_PENDING = "En cours…";
const DEFAULT_ERROR = "Erreur";

const defaults: ToastOptions = {
  position: "top-right",
  theme: "dark",
};

export type NotifyPromiseMessages = {
  pending?: string;
  success: string;
  error?: string;
};

/** Messages courts pour les toasts (pas de texte long). */
export function truncateToastMessage(
  message: string,
  max = MAX_TOAST_CHARS,
): string {
  const compact = message.trim().replace(/\s+/g, " ");
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1).trim()}…`;
}

function normalizeMessages<T>(
  messages: NotifyPromiseMessages,
): ToastPromiseParams<T> {
  return {
    pending: messages.pending
      ? truncateToastMessage(messages.pending)
      : DEFAULT_PENDING,
    success: truncateToastMessage(messages.success),
    error: messages.error
      ? truncateToastMessage(messages.error)
      : DEFAULT_ERROR,
  };
}

function promiseToast<T>(
  promise: Promise<T>,
  messages: NotifyPromiseMessages,
  options?: ToastOptions<T>,
): Promise<T> {
  return toast.promise<T>(promise, normalizeMessages<T>(messages), {
    ...defaults,
    ...options,
  } as ToastOptions<T>);
}

/** Notifications plateforme — thème dark, Promise, messages courts */
export const notify = {
  promise<T>(
    promise: Promise<T>,
    messages: NotifyPromiseMessages,
    options?: ToastOptions<T>,
  ): Promise<T> {
    return promiseToast(promise, messages, options);
  },

  success(message: string, options?: ToastOptions) {
    return promiseToast(
      Promise.resolve(message),
      { success: message },
      { ...options, type: "success" },
    );
  },

  error(message: string, options?: ToastOptions) {
    const short = truncateToastMessage(message);
    return promiseToast(
      Promise.reject(new Error(short)),
      { success: short, error: short },
      { ...options, type: "error" },
    );
  },

  warning(message: string, options?: ToastOptions) {
    return promiseToast(
      Promise.resolve(message),
      { success: message },
      { ...options, type: "warning" },
    );
  },

  info(message: string, options?: ToastOptions) {
    return promiseToast(
      Promise.resolve(message),
      { success: message },
      { ...options, type: "info" },
    );
  },
};
