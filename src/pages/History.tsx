import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import {
  ArrowUpRight,
  ArrowDownRight,
  History as HistoryIcon,
  Filter,
  Loader2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { getMyTransactions } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: string;
  user_id: string;
  type: "ACHAT" | "VENTE";
  crypto: string;
  network: string;
  amount_crypto: string;
  amount_ariary: string;
  wallet_address: string | null;
  wallet_name?: string | null;
  wallet_lien?: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  reference: string;
}

const TIMER_DURATION = 15 * 60; // 15 minutes en secondes

const statusColors: Record<string, string> = {
  EN_ATTENTE: "bg-warning/10 text-warning border-warning/20",
  PAYE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CRYPTO_ENVOYEE: "bg-accent/10 text-accent border-accent/20",
  TERMINE: "bg-success/10 text-success border-success/20",
  REFUSE: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYE: "Payé",
  CRYPTO_ENVOYEE: "Crypto envoyée",
  TERMINE: "Terminé",
  REFUSE: "Refusé",
};

// ─── Hook minuteur par transaction ───────────────────────────────────────────
function useTransactionTimer(createdAt: string) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const elapsed = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / 1000,
    );
    return Math.max(0, TIMER_DURATION - elapsed);
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []); // ne se relance pas — chaque transaction a sa propre instance

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const percent = (secondsLeft / TIMER_DURATION) * 100;
  const expired = secondsLeft <= 0;

  return { secondsLeft, formatted, percent, expired };
}

// ─── Composant minuteur affiché dans chaque carte ────────────────────────────
function TransactionTimer({ createdAt }: { createdAt: string }) {
  const { formatted, percent, expired } = useTransactionTimer(createdAt);

  const barColor =
    percent > 50
      ? "bg-success"
      : percent > 25
        ? "bg-warning"
        : "bg-destructive";

  const textColor =
    percent > 50
      ? "text-success border-success/20 bg-success/10"
      : percent > 25
        ? "text-warning border-warning/20 bg-warning/10"
        : "text-destructive border-destructive/20 bg-destructive/10";

  return (
    <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
      <Timer className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground">Temps restant :</span>

      {expired ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border bg-success/10 text-success border-success/20">
          Expiré
        </span>
      ) : (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${textColor}`}
        >
          {formatted}
        </span>
      )}

      {/* Barre de progression */}
      <div className="flex-1 min-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${expired ? "bg-success w-0" : barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function History() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "ACHAT" | "VENTE">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const data = await getMyTransactions();
        setTransactions(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des transactions:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <HistoryIcon className="h-5 w-5 text-accent" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Historique
              </h1>
            </div>
            <p className="text-muted-foreground">
              Suivez toutes vos transactions
            </p>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtres:</span>
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v: "all" | "ACHAT" | "VENTE") => setTypeFilter(v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="ACHAT">Achats</SelectItem>
                <SelectItem value="VENTE">Ventes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="PAYE">Payé</SelectItem>
                <SelectItem value="CRYPTO_ENVOYEE">Crypto envoyée</SelectItem>
                <SelectItem value="TERMINE">Terminé</SelectItem>
                <SelectItem value="REFUSE">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des transactions */}
          <div className="space-y-4 animate-slide-up">
            {isLoading ? (
              <div className="text-center py-12 rounded-2xl bg-card border border-border">
                <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">
                  Chargement des transactions...
                </p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-card border border-border">
                <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucune transaction trouvée
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Type & Crypto */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          tx.type === "ACHAT"
                            ? "bg-success/10"
                            : "bg-blue-500/10"
                        }`}
                      >
                        {tx.type === "ACHAT" ? (
                          <ArrowUpRight className="h-6 w-6 text-success" />
                        ) : (
                          <ArrowDownRight className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                              tx.type === "ACHAT"
                                ? "bg-success/10 text-success"
                                : "bg-blue-500/10 text-blue-500"
                            }`}
                          >
                            {tx.type}
                          </span>
                          {(tx.crypto === "USDT" ||
                            tx.crypto === "BTC" ||
                            tx.crypto === "TRX" ||
                            tx.crypto === "LTC") && (
                            <CryptoIcon symbol={tx.crypto} size="sm" />
                          )}
                          <span className="font-semibold">{tx.crypto}</span>
                          <span className="text-muted-foreground text-sm">
                            ({tx.network})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Réf: {tx.reference} • {formatDate(tx.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Montants */}
                    <div className="md:text-right">
                      <p className="font-bold">
                        {parseFloat(tx.amount_crypto)} {tx.crypto}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {parseFloat(tx.amount_ariary).toLocaleString("fr-FR")}{" "}
                        Ar
                      </p>
                    </div>

                    {/* Statut */}
                    <div>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[tx.status] || "bg-muted text-muted-foreground border-muted"}`}
                      >
                        {statusLabels[tx.status] || tx.status}
                      </span>
                    </div>
                  </div>

                  {/* Wallet info */}
                  {(tx.wallet_lien ||
                    tx.wallet_name ||
                    (tx.type === "ACHAT" && tx.wallet_address)) && (
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-end gap-4">
                      {(tx.wallet_lien || tx.wallet_name) && (
                        <div className="flex flex-col items-center gap-1.5">
                          {tx.wallet_lien ? (
                            <img
                              src={tx.wallet_lien}
                              alt=""
                              className="h-12 w-12 rounded-lg object-cover border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
                          {tx.wallet_name ? (
                            <span className="text-xs font-semibold text-center max-w-[140px] leading-tight">
                              {tx.wallet_name}
                            </span>
                          ) : null}
                        </div>
                      )}
                      {tx.type === "ACHAT" && tx.wallet_address && (
                        <p className="text-sm text-muted-foreground flex-1 min-w-[200px]">
                          Adresse de réception:{" "}
                          <span className="font-mono text-foreground">
                            {tx.wallet_address}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* ✅ Minuteur 15 min — propre à chaque transaction */}
                  <TransactionTimer createdAt={tx.created_at} />
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
