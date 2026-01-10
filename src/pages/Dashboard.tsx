import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  TrendingUp,
  Wallet,
  History,
  ChevronRight
} from "lucide-react";

// Mock data
const recentTransactions = [
  { id: "TXN001", type: "ACHAT", crypto: "USDT", amount: "100 000 Ar", status: "TERMINE", date: "10/01/2024" },
  { id: "TXN002", type: "VENTE", crypto: "BTC", amount: "0.001 BTC", status: "EN_ATTENTE", date: "09/01/2024" },
  { id: "TXN003", type: "ACHAT", crypto: "TRX", amount: "50 000 Ar", status: "CRYPTO_ENVOYEE", date: "08/01/2024" },
];

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Welcome */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Bienvenue, {user?.name} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos échanges de cryptomonnaies
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Total échanges</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-success" />
                </div>
              </div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Achats</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Ventes</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </div>

          {/* Action Buttons */}
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

          {/* Recent Transactions */}
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
              {recentTransactions.map((tx) => (
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
                      <p className="text-sm text-muted-foreground">{tx.id} • {tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{tx.amount}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tx.status]}`}>
                      {statusLabels[tx.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Money Info */}
          <div className="mt-8 p-6 rounded-2xl bg-muted border border-border">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Votre compte Mobile Money</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.mobileMoneyType}: <span className="font-medium text-foreground">{user?.phone}</span>
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
