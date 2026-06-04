import { toast, type ToastOptions } from "react-toastify";

const MAX_TOAST_CHARS = 48;

const DEFAULT_PENDING = "En cours…";
const DEFAULT_ERROR = "Erreur";

const defaults: ToastOptions = {
  position: "top-right",
  theme: "dark",
};

export type NotifyPromiseMessages<T = unknown> = {
  pending?: string;
  success: string | ((value: T) => string);
  error?: string | ((err: unknown) => string);
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

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return truncateToastMessage(err);
  if (err instanceof Error) return truncateToastMessage(err.message);
  return fallback;
}

function normalizeMessages<T>(
  messages: NotifyPromiseMessages<T>,
): NotifyPromiseMessages<T> {
  const success =
    typeof messages.success === "function"
      ? (value: T) => truncateToastMessage(messages.success(value))
      : truncateToastMessage(messages.success);

  const error = messages.error
    ? typeof messages.error === "function"
      ? (err: unknown) => truncateToastMessage(String(messages.error(err)))
      : truncateToastMessage(messages.error)
    : (err: unknown) => resolveErrorMessage(err, DEFAULT_ERROR);

  return {
    pending: messages.pending
      ? truncateToastMessage(messages.pending)
      : undefined,
    success,
    error,
  };
}

function promiseToast<T>(
  promise: Promise<T>,
  messages: NotifyPromiseMessages<T>,
  options?: ToastOptions,
) {
  const normalized = normalizeMessages(messages);
  return toast.promise(
    promise,
    {
      pending: normalized.pending ?? DEFAULT_PENDING,
      success: normalized.success,
      error: normalized.error,
    },
    { ...defaults, ...options },
  );
}

/** Notifications plateforme — thème dark, Promise, messages courts */
export const notify = {
  promise<T>(
    promise: Promise<T>,
    messages: NotifyPromiseMessages<T>,
    options?: ToastOptions,
  ) {
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
