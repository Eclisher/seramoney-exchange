import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardContent } from "@/components/admin/DashboardContent";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Administration">
      <DashboardContent />
    </AdminLayout>
  );
}
