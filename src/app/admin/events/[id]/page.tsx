import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminEventDetailPage } from "@/components/admin/AdminEventDetailPage";
import { getEffectiveAdminSecret } from "@/lib/admin-auth";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEventDetailRoutePage({ params }: Props) {
  const secret = await getEffectiveAdminSecret();
  if (!secret) return <AdminLogin />;

  const { id } = await params;
  return <AdminEventDetailPage adminSecret={secret} eventId={id} />;
}
