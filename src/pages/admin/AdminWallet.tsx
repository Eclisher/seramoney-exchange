import { AdminLayout } from "@/components/admin/AdminLayout";
import { WalletContent } from "@/components/admin/WalletContent";

export default function AdminWallet() {
    return (
        < AdminLayout title="Gestion des portefeuilles">
            <WalletContent />
        </AdminLayout>
    );
}