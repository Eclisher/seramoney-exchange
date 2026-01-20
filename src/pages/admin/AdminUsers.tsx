import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersContent } from "@/components/admin/UsersContent";

export default function AdminUsers() {
  return (
    <AdminLayout title="Gestion des utilisateurs">
      <UsersContent />
    </AdminLayout>
  );
}
