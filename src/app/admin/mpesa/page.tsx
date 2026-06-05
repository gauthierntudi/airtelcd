import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminMpesaPage } from "@/components/admin/AdminMpesaPage";
import { getEffectiveAdminSecret } from "@/lib/admin-auth";

export default async function AdminMpesaRoutePage() {
  const secret = await getEffectiveAdminSecret();
  if (!secret) return <AdminLogin />;

  return <AdminMpesaPage adminSecret={secret} />;
}
