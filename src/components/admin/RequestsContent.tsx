import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import api, { getTransactionImages, updateTransactionStatus } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message ===
      "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

interface Transaction {
  id: string;
  type: "ACHAT" | "VENTE";
  crypto: string;
  network: string;
  amount_ariary: string;
  amount_crypto: string;
  wallet_address?: string | null;
  status: "EN_ATTENTE" | "PAYE" | "CRYPTO_ENVOYEE" | "TERMINE" | "REFUSE";
  notes?: string | null;
  reference: string;
  created_at: string;
  updated_at?: string | null;
  client_name: string;
  phone_number: string;
  mobile_money_type?: string;
  wallet_lien?: string;
  wallet_name?: string;
}

const statusColors: Record<string, string> = {
  EN_ATTENTE: "bg-warning/10 text-warning",
  PAYE: "bg-blue-500/10 text-blue-500",
  CRYPTO_ENVOYEE: "bg-accent/10 text-accent",
  TERMINE: "bg-success/10 text-success",
  REFUSE: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYE: "Payé",
  CRYPTO_ENVOYEE: "Crypto envoyée",
  TERMINE: "Terminé",
  REFUSE: "Refusé",
};

const allowedStatuses: Array<{ value: string; label: string }> = [
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "PAYE", label: "Payé" },
  { value: "CRYPTO_ENVOYEE", label: "Crypto envoyée" },
  { value: "TERMINE", label: "Terminé" },
];

export function RequestsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [proofTransaction, setProofTransaction] = useState<Transaction | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofImages, setProofImages] = useState<
    Array<{ id: string; image_base64: string; title: string; created_at: string }>
  >([]);
  const { toast } = useToast();

  // Charger les transactions depuis l'API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/transactions");
        setTransactions(response.data);
      } catch (error: unknown) {
        toast({
          title: "Erreur",
          description: getApiErrorMessage(error, "Impossible de charger les transactions"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  const handleStatusChange = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setNotes(transaction.notes || "");
  };

  const openProofs = async (transaction: Transaction) => {
    setProofTransaction(transaction);
    setProofImages([]);
    try {
      setProofLoading(true);
      const images = await getTransactionImages(transaction.id);
      setProofImages(Array.isArray(images) ? images : []);
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: getApiErrorMessage(error, "Impossible de charger les preuves"),
        variant: "destructive",
      });
    } finally {
      setProofLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedTransaction || !newStatus) return;
    const token = localStorage.getItem("seramoney-token");
    if (!token) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour modifier le statut d'une transaction",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      await updateTransactionStatus(selectedTransaction.id, newStatus, notes || undefined);
      
      setTransactions(transactions.map(t => 
        t.id === selectedTransaction.id 
          ? { ...t, status: newStatus as Transaction["status"], notes: notes || null, updated_at: new Date().toISOString() }
          : t
      ));

      toast({
        title: "Succès",
        description: `Statut mis à jour: ${statusLabels[newStatus]}`,
      });

      setSelectedTransaction(null);
      setNewStatus("");
      setNotes("");
    } catch (error: unknown) {
      let errorMessage = "Impossible de mettre à jour le statut";
      
      if (typeof error === "object" && error && "response" in error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 401) {
          errorMessage = "Vous n'êtes pas autorisé. Veuillez vous reconnecter.";
        } else if (status === 403) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
        } else {
          errorMessage = getApiErrorMessage(error, errorMessage);
        }
      } else if (typeof error === "object" && error && "request" in error) {
        errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
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

  const formatMobileMoneyType = (type?: string) => {
    if (!type) return "";
    const mapping: Record<string, string> = {
      MVOLA: "MVola",
      ORANGE: "OrangeMoney",
    };
    return mapping[type.toUpperCase()] || type;
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h2 className="font-display text-xl sm:text-2xl font-bold">Demandes</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Gérez les demandes d'achat et de vente</p>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chargement des transactions...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-semibold text-sm">Client</th>
                  <th className="text-left p-4 font-semibold text-sm">Type</th>
                  <th className="text-left p-4 font-semibold text-sm">Crypto</th>
                  <th className="text-left p-4 font-semibold text-sm">Montant</th>
                  <th className="text-left p-4 font-semibold text-sm">Référence</th>
                  <th className="text-left p-4 font-semibold text-sm">Portefeuille</th>
                  <th className="text-left p-4 font-semibold text-sm">Preuve</th>
                  <th className="text-left p-4 font-semibold text-sm">Statut</th>
                  <th className="text-left p-4 font-semibold text-sm">Date</th>
                  <th className="text-left p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      Aucune transaction trouvée
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{tx.client_name}</p>
                          <p className="text-sm text-muted-foreground">{tx.phone_number}</p>
                          {tx.mobile_money_type && (
                            <p className="text-xs text-accent">{formatMobileMoneyType(tx.mobile_money_type)}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === "ACHAT" ? "bg-success/10 text-success" : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={tx.crypto} size="sm" />
                        <div>
                          <p className="font-medium">{tx.crypto}</p>
                          <p className="text-xs text-muted-foreground">{tx.network}</p>
                        </div>
                      </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{parseFloat(tx.amount_crypto)} {tx.crypto}</p>
                        <p className="text-sm text-muted-foreground">{parseFloat(tx.amount_ariary).toLocaleString("fr-FR")} Ar</p>
                        {tx.wallet_address && (
                          <p className="text-xs text-muted-foreground font-mono mt-1 break-all max-w-[150px]">
                            {tx.wallet_address}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-xs font-mono text-muted-foreground">{tx.reference}</p>
                      </td>
                      <td className="p-4">
                        <img src={tx.wallet_lien} alt={tx.wallet_name} className="h-10 w-10 rounded-full object-cover border" />
                        <p className="text-xs text-muted-foreground">{tx.wallet_name}</p>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openProofs(tx)}
                        >
                          Voir
                        </Button>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[tx.status]}`}>
                          {statusLabels[tx.status]}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-xs text-muted-foreground">{formatDateTime(tx.created_at)}</p>
                        {tx.updated_at && tx.updated_at !== tx.created_at && (
                          <p className="text-xs text-muted-foreground">Modifié: {formatDateTime(tx.updated_at)}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleStatusChange(tx)}
                        >
                          Changer statut
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

      {/* Proofs Dialog */}
      <Dialog
        open={!!proofTransaction}
        onOpenChange={() => {
          setProofTransaction(null);
          setProofImages([]);
          setProofLoading(false);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preuves</DialogTitle>
            <DialogDescription>
              Transaction: {proofTransaction?.reference}
              <br />
              Client: {proofTransaction?.client_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {proofLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Chargement...</span>
              </div>
            ) : proofImages.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Aucune preuve.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proofImages.map((img) => (
                  <div key={img.id} className="rounded-xl border border-border p-3 bg-muted/10">
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <p className="font-medium text-sm">{img.title || "Preuve"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(img.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <img
                      src={`data:image/png;base64,${img.image_base64}`}
                      alt={img.title || "Preuve"}
                      className="w-full rounded-lg border object-contain bg-background"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setProofTransaction(null);
                setProofImages([]);
                setProofLoading(false);
              }}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => {
        setSelectedTransaction(null);
        setNewStatus("");
        setNotes("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut de la transaction</DialogTitle>
            <DialogDescription>
              Transaction: {selectedTransaction?.reference}
              <br />
              Client: {selectedTransaction?.client_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nouveau statut</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (optionnel)</label>
              <Textarea
                placeholder="Ajouter des notes pour cette transaction..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedTransaction(null);
                setNewStatus("");
                setNotes("");
              }}
              disabled={updating}
            >
              Annuler
            </Button>
            <Button 
              variant="accent" 
              onClick={confirmStatusChange}
              disabled={updating || !newStatus || newStatus === selectedTransaction?.status}
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Confirmer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
