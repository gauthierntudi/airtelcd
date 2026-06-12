import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminMessagesPage } from "@/components/admin/AdminMessagesPage";
import { getEffectiveAdminSecret } from "@/lib/admin-auth";

export default async function AdminMessagesRoutePage() {
  const secret = await getEffectiveAdminSecret();
  if (!secret) return <AdminLogin />;

  return <AdminMessagesPage adminSecret={secret} />;
}
