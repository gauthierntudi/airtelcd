"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { checkinDisplayPath } from "@/lib/checkin/urls";
import type { CheckinKioskView } from "@/lib/checkin/kiosk-service";
import { publicPath } from "@/lib/branding";

const STORAGE_KEY = "golf2026-checkin-display-token";

export function CheckinDisplayBootstrap() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const forceNew =
          new URLSearchParams(window.location.search).has("new") ||
          new URLSearchParams(window.location.search).has("nouvelle");

        if (!forceNew) {
          const stored = sessionStorage.getItem(STORAGE_KEY);
          if (stored) {
            router.replace(checkinDisplayPath(stored));
            return;
          }
        }

        const res = await fetch(publicPath("/api/checkin/kiosk"), { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Impossible d'ouvrir la borne");
        }

        const token = (data as CheckinKioskView).token;
        if (!token) throw new Error("Session borne invalide");

        if (cancelled) return;
        sessionStorage.setItem(STORAGE_KEY, token);
        router.replace(checkinDisplayPath(token));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-vodacom-black px-6 text-center text-white">
        <p className="font-vodafone-lt text-lg text-white/70">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-vodacom-red px-8 py-3 font-vodafone-rg-bd text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-vodacom-black text-white">
      <LucideIcon icon={Loader2} size={40} className="animate-spin text-white/40" />
      <p className="mt-4 font-vodafone-lt text-sm text-white/50">
        Préparation de la borne check-in…
      </p>
    </div>
  );
}
