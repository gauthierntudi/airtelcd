"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminInsights } from "@/components/admin/AdminInsights";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRsvpChart } from "@/components/admin/AdminRsvpChart";
import { AdminStats } from "@/components/admin/AdminStats";
import { GuestList } from "@/components/admin/GuestList";
import type { GuestRow } from "@/lib/guest-types";
import type { MessagingStatus } from "@/lib/messaging/config";
import { notify } from "@/lib/toast";
import { publicPath } from "@/lib/branding";

type Props = {
  adminSecret: string;
  messagingStatus: MessagingStatus;
};

export function AdminDashboard({ adminSecret, messagingStatus }: Props) {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret,
    }),
    [adminSecret],
  );

  const loadGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(publicPath("/api/guests"), {
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setGuests(data);
    } catch (e) {
      notify.error(
        e instanceof Error ? e.message : "Impossible de charger les invités",
      );
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  return (
    <AdminLayout onRefresh={loadGuests} loading={loading}>
      <section className="mb-6">
        <AdminStats guests={guests} />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <AdminRsvpChart guests={guests} />
        <AdminInsights guests={guests} messagingStatus={messagingStatus} />
      </section>

      <GuestList
        guests={guests}
        loading={loading}
        headers={headers}
        messagingStatus={messagingStatus}
        onChanged={loadGuests}
      />
    </AdminLayout>
  );
}
