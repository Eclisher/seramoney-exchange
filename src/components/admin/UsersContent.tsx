import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api, { getClientTransactions } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  mobile_money_type: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: "ACHAT" | "VENTE";
  crypto: string;
  network: string;
  amount_crypto: string;
  amount_ariary: string;
  wallet_address: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  reference: string;
}

export function UsersContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Record<string, Transaction[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/users");
        setUsers(response.data);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.response?.data?.message || "Impossible de charger les utilisateurs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Charger les transactions d'un utilisateur
  const fetchUserTransactions = async (userId: string) => {
    try {
      setLoadingTransactions(userId);
      const data = await getClientTransactions(userId);
      setTransactions(prev => ({
        ...prev,
        [userId]: data
      }));
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de charger les transactions",
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(null);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    // Charger les transactions si elles ne sont pas déjà chargées
    if (!transactions[user.id]) {
      fetchUserTransactions(user.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (tx: Transaction) => {
    if (tx.type === "ACHAT") {
      return `${parseFloat(tx.amount_ariary).toLocaleString("fr-FR")} Ar`;
    } else {
      return `${parseFloat(tx.amount_crypto)} ${tx.crypto}`;
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      EN_ATTENTE: "bg-warning/10 text-warning",
      PAYE: "bg-blue-500/10 text-blue-500",
      CRYPTO_ENVOYEE: "bg-accent/10 text-accent",
      TERMINE: "bg-success/10 text-success",
      REFUSE: "bg-destructive/10 text-destructive",
    };
    return statusColors[status] || "bg-muted text-muted-foreground";
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      EN_ATTENTE: "En attente",
      PAYE: "Payé",
      CRYPTO_ENVOYEE: "Crypto envoyée",
      TERMINE: "Terminé",
      REFUSE: "Refusé",
    };
    return statusLabels[status] || status;
  };

  const formatMobileMoneyType = (type: string) => {
    const mapping: Record<string, string> = {
      MVOLA: "MVola",
      ORANGE: "OrangeMoney",
    };
    return mapping[type] || type;
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone_number.includes(searchQuery)
  );

  return (
    <>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold">Utilisateurs</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Liste des clients inscrits</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-[300px]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chargement des utilisateurs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-semibold text-sm">Nom</th>
                  <th className="text-left p-4 font-semibold text-sm">Contact</th>
                  <th className="text-left p-4 font-semibold text-sm">Mobile Money</th>
                  <th className="text-left p-4 font-semibold text-sm">Rôle</th>
                  <th className="text-left p-4 font-semibold text-sm">Statut</th>
                  <th className="text-left p-4 font-semibold text-sm">Inscrit le</th>
                  <th className="text-left p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">{u.full_name[0]}</span>
                          </div>
                          <span className="font-medium">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{u.email}</p>
                        <p className="text-sm text-muted-foreground">{u.phone_number}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-accent/10 text-accent text-sm font-medium">
                          {formatMobileMoneyType(u.mobile_money_type)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.role === "ADMIN" 
                            ? "bg-primary/10 text-primary" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.is_active 
                            ? "bg-success/10 text-success" 
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {u.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="p-4">
                        <Button size="sm" variant="ghost" onClick={() => handleUserClick(u)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{selectedUser.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Money</p>
                  <p className="font-medium">{formatMobileMoneyType(selectedUser.mobile_money_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rôle</p>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedUser.is_active 
                        ? "bg-success/10 text-success" 
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {selectedUser.is_active ? "Actif" : "Inactif"}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Historique des transactions</h4>
                {loadingTransactions === selectedUser.id ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
                  </div>
                ) : transactions[selectedUser.id] && transactions[selectedUser.id].length > 0 ? (
                  <div className="rounded-xl border border-border divide-y divide-border max-h-[400px] overflow-y-auto">
                    {transactions[selectedUser.id].map((tx) => (
                      <div key={tx.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                tx.type === "ACHAT" ? "bg-success/10 text-success" : "bg-blue-500/10 text-blue-500"
                              }`}>
                                {tx.type}
                              </span>
                              <p className="font-medium text-sm">{tx.crypto}</p>
                              <span className="text-xs text-muted-foreground">({tx.network})</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Réf: {tx.reference} • {formatDateTime(tx.created_at)}
                            </p>
                            {tx.wallet_address && (
                              <p className="text-xs text-muted-foreground">
                                Wallet: <span className="font-mono">{tx.wallet_address}</span>
                              </p>
                            )}
                            {tx.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Note: {tx.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm mb-1">{formatAmount(tx)}</p>
                            {tx.type === "ACHAT" && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {parseFloat(tx.amount_crypto)} {tx.crypto}
                              </p>
                            )}
                            {tx.type === "VENTE" && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {parseFloat(tx.amount_ariary).toLocaleString("fr-FR")} Ar
                              </p>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                              {getStatusLabel(tx.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border p-8 text-center text-muted-foreground">
                    <p>Aucune transaction trouvée</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
