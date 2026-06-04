import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
};

export function AdminLayout({
  children,
  title = "Tableau de bord",
  subtitle = "Gestion des invitations et suivi RSVP",
  onRefresh,
  loading,
}: Props) {
  return (
    <div className="admin-dark min-h-screen bg-[#0c0c0c] text-white">
      <AdminSidebar />
      <div className="flex min-h-screen flex-col lg:pl-[240px]">
        <AdminTopBar
          title={title}
          subtitle={subtitle}
          onRefresh={onRefresh}
          loading={loading}
        />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
