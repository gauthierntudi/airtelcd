"use client";

import { ToastProvider } from "@/components/providers/ToastProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
