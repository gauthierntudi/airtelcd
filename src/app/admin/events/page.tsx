import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminEventsPage } from "@/components/admin/AdminEventsPage";
import { getEffectiveAdminSecret } from "@/lib/admin-auth";

export default async function AdminEventsRoutePage() {
  const secret = await getEffectiveAdminSecret();
  if (!secret) return <AdminLogin />;

  return <AdminEventsPage adminSecret={secret} />;
}
