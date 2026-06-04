import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getEffectiveAdminSecret } from "@/lib/admin-auth";
import { getMessagingStatus } from "@/lib/messaging/config";

export default async function AdminPage() {
  const secret = await getEffectiveAdminSecret();
  if (!secret) return <AdminLogin />;

  return (
    <AdminDashboard
      adminSecret={secret}
      messagingStatus={getMessagingStatus()}
    />
  );
}
