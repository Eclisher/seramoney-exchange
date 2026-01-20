import { AdminLayout } from "@/components/admin/AdminLayout";
import { RequestsContent } from "@/components/admin/RequestsContent";

export default function AdminRequests() {
  return (
    <AdminLayout title="Gestion des demandes">
      <RequestsContent />
    </AdminLayout>
  );
}
