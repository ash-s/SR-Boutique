import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-4 pt-16 lg:p-8 lg:pt-8">
        <AdminSetupNotice />
        {children}
      </main>
    </div>
  );
}
