import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { ArrowUpRight, ArrowDownRight, History as HistoryIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// Mock transactions
const allTransactions = [
  { 
    id: "TXN001", 
    type: "ACHAT" as const, 
    crypto: "USDT" as const, 
    network: "TRC20",
    amountCrypto: "21.74",
    amountAr: "100 000", 
    walletAddress: "TXyz...abc123",
    status: "TERMINE" as const, 
    date: "10/01/2024 14:30" 
  },
  { 
    id: "TXN002", 
    type: "VENTE" as const, 
    crypto: "BTC" as const, 
    network: "BTC",
    amountCrypto: "0.001",
    amountAr: "450 000", 
    status: "EN_ATTENTE" as const, 
    date: "09/01/2024 10:15" 
  },
  { 
    id: "TXN003", 
    type: "ACHAT" as const, 
    crypto: "TRX" as const, 
    network: "TRC20",
    amountCrypto: "90.91",
    amountAr: "50 000", 
    walletAddress: "TQwer...xyz789",
    status: "CRYPTO_ENVOYEE" as const, 
    date: "08/01/2024 16:45" 
  },
  { 
    id: "TXN004", 
    type: "VENTE" as const, 
    crypto: "USDT" as const, 
    network: "BEP20",
    amountCrypto: "50",
    amountAr: "225 000", 
    status: "PAYE" as const, 
    date: "07/01/2024 09:00" 
  },
  { 
    id: "TXN005", 
    type: "ACHAT" as const, 
    crypto: "LTC" as const, 
    network: "LTC",
    amountCrypto: "0.5",
    amountAr: "230 000", 
    walletAddress: "ltc1q...def456",
    status: "REFUSE" as const, 
    date: "05/01/2024 11:20" 
  },
];

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

export default function History() {
  const [typeFilter, setTypeFilter] = useState<"all" | "ACHAT" | "VENTE">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTransactions = allTransactions.filter((tx) => {
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
              <h1 className="font-display text-2xl md:text-3xl font-bold">Historique</h1>
            </div>
            <p className="text-muted-foreground">
              Suivez toutes vos transactions
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtres:</span>
            </div>
            <Select value={typeFilter} onValueChange={(v: "all" | "ACHAT" | "VENTE") => setTypeFilter(v)}>
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

          {/* Transactions List */}
          <div className="space-y-4 animate-slide-up">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-card border border-border">
                <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune transaction trouvée</p>
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
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        tx.type === "ACHAT" ? "bg-success/10" : "bg-blue-500/10"
                      }`}>
                        {tx.type === "ACHAT" ? (
                          <ArrowUpRight className="h-6 w-6 text-success" />
                        ) : (
                          <ArrowDownRight className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            tx.type === "ACHAT" ? "bg-success/10 text-success" : "bg-blue-500/10 text-blue-500"
                          }`}>
                            {tx.type}
                          </span>
                          <CryptoIcon crypto={tx.crypto} size="sm" />
                          <span className="font-semibold">{tx.crypto}</span>
                          <span className="text-muted-foreground text-sm">({tx.network})</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Réf: {tx.id} • {tx.date}
                        </p>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="md:text-right">
                      <p className="font-bold">{tx.amountCrypto} {tx.crypto}</p>
                      <p className="text-sm text-muted-foreground">{tx.amountAr} Ar</p>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[tx.status]}`}>
                        {statusLabels[tx.status]}
                      </span>
                    </div>
                  </div>

                  {/* Wallet address for purchases */}
                  {tx.type === "ACHAT" && tx.walletAddress && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Wallet: <span className="font-mono text-foreground">{tx.walletAddress}</span>
                      </p>
                    </div>
                  )}
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
