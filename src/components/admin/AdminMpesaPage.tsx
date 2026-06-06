"use client";

import { useCallback, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminMpesaPanel } from "@/components/admin/AdminMpesaPanel";

type Props = {
  adminSecret: string;
};

export function AdminMpesaPage({ adminSecret }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <AdminLayout
      title="Carte Visa M-Pesa & Vodacom Market"
      subtitle="Suivi des cartes invités, bonus Vodacom Market et transactions USSD"
      onRefresh={refresh}
      loading={loading}
    >
      <AdminMpesaPanel
        adminSecret={adminSecret}
        refreshKey={refreshKey}
        onLoadingChange={setLoading}
      />
    </AdminLayout>
  );
}
