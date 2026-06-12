"use client";

import { useCallback, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminMessagesPanel } from "@/components/admin/AdminMessagesPanel";

type Props = {
  adminSecret: string;
};

export function AdminMessagesPage({ adminSecret }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <AdminLayout
      title="Messages WhatsApp"
      subtitle="Envoi de templates génériques aux invités check-in par jour"
      onRefresh={refresh}
      loading={loading}
    >
      <AdminMessagesPanel
        adminSecret={adminSecret}
        refreshKey={refreshKey}
        onLoadingChange={setLoading}
      />
    </AdminLayout>
  );
}
