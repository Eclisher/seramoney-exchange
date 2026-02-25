import { AdminLayout } from "@/components/admin/AdminLayout";
import { CryptosContent } from "@/components/admin/CryptosContent";

export default function AdminCryptos() {
  return (
    <AdminLayout title="Gestion des cryptomonnaies">
      <CryptosContent />
    </AdminLayout>
  );
}
