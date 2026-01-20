import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getMyTransactions } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  TrendingUp,
  Wallet,
  History,
  ChevronRight,
  Loader2
} from "lucide-react";

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

export default function Dashboard() {
  const { user } = useAuth();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      try {
        setIsLoadingTransactions(true);
        const data = await getMyTransactions();
        setAllTransactions(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Calculer les statistiques à partir de toutes les transactions
  const stats = useMemo(() => {
    const total = allTransactions.length;
    const achats = allTransactions.filter(tx => tx.type === "ACHAT").length;
    const ventes = allTransactions.filter(tx => tx.type === "VENTE").length;
    const enAttente = allTransactions.filter(tx => tx.status === "EN_ATTENTE").length;

    return { total, achats, ventes, enAttente };
  }, [allTransactions]);

  // Limiter à 3 transactions les plus récentes pour l'affichage
  const recentTransactions = useMemo(() => {
    return allTransactions.slice(0, 3);
  }, [allTransactions]);

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Formater le montant pour l'affichage
  const formatAmount = (tx: Transaction) => {
    if (tx.type === "ACHAT") {
      return `${parseFloat(tx.amount_ariary).toLocaleString("fr-FR")} Ar`;
    } else {
      return `${parseFloat(tx.amount_crypto)} ${tx.crypto}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Bienvenue, {user?.full_name} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos échanges de cryptomonnaies
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">{isLoadingTransactions ? "..." : stats.total}</p>
              <p className="text-sm text-muted-foreground">Total échanges</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-success" />
                </div>
              </div>
              <p className="text-2xl font-bold">{isLoadingTransactions ? "..." : stats.achats}</p>
              <p className="text-sm text-muted-foreground">Achats</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">{isLoadingTransactions ? "..." : stats.ventes}</p>
              <p className="text-sm text-muted-foreground">Ventes</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
              <p className="text-2xl font-bold">{isLoadingTransactions ? "..." : stats.enAttente}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link
              to="/buy"
              className="group p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold">Acheter Crypto</h3>
                  <p className="text-sm opacity-80 mt-1">Achetez des cryptos avec Mobile Money</p>
                </div>
                <ChevronRight className="h-6 w-6 opacity-60 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/sell"
              className="group p-6 rounded-2xl bg-card border-2 border-accent hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <ArrowDownRight className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-bold">Vendre Crypto</h3>
                  <p className="text-sm text-muted-foreground mt-1">Convertissez vos cryptos en Ariary</p>
                </div>
                <ChevronRight className="h-6 w-6 text-accent opacity-60 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <History className="h-5 w-5 text-accent" />
                </div>
                <h2 className="font-display text-lg font-semibold">Transactions récentes</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/history">
                  Voir tout
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="divide-y divide-border">
              {isLoadingTransactions ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Aucune transaction récente</p>
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === "ACHAT" ? "bg-success/10" : "bg-blue-500/10"
                      }`}>
                        {tx.type === "ACHAT" ? (
                          <ArrowUpRight className={`h-5 w-5 ${tx.type === "ACHAT" ? "text-success" : "text-blue-500"}`} />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.type} {tx.crypto}</p>
                        <p className="text-sm text-muted-foreground">{tx.reference} • {formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatAmount(tx)}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tx.status] || "bg-muted text-muted-foreground"}`}>
                        {statusLabels[tx.status] || tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-muted border border-border">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Votre compte Mobile Money</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">{user?.phone_number}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
