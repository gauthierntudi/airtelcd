"use client";

import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { useState } from "react";
import { VodacomIcon } from "@/components/branding/VodacomIcon";
import { notify } from "@/lib/toast";

export function AdminLogin() {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (!res.ok) {
      const data = await res.json();
      notify.error("Accès refusé");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl"
      >
        <VodacomIcon size={56} className="mb-4" priority />
        <h1 className="mb-2 text-xl font-bold text-zinc-900">Accès administrateur</h1>
        <p className="mb-6 text-sm text-zinc-500">
          Entrez le secret défini dans <code className="text-xs text-vodacom-red">ADMIN_SECRET</code>.
        </p>
        <label className="block">
          <span className="text-sm font-medium text-zinc-800">Secret</span>
          <input
            type="password"
            required
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/20"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-vodacom-red py-2.5 font-semibold text-white hover:bg-vodacom-red-dark disabled:opacity-60"
        >
          {loading ? (
            <LucideIcon icon={Loader2} size={18} className="animate-spin" />
          ) : (
            <LucideIcon icon={Lock} size={18} />
          )}
          {loading ? "Vérification…" : "Connexion"}
        </button>
      </form>
    </div>
  );
}
