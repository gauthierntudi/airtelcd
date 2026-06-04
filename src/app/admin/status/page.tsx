import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";
import { getEffectiveAdminSecret } from "@/lib/admin-auth";
import { getSystemMessagingReport } from "@/lib/messaging/config";

export default async function AdminStatusPage() {
  const secret = await getEffectiveAdminSecret();
  if (!secret) return <AdminLogin />;

  return <AdminSystemStatus report={getSystemMessagingReport()} />;
}
