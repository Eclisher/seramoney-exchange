import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

interface Transaction {
  id: string;
  type: "ACHAT" | "VENTE";
  reference: string;
  crypto: string;
  network: string;
  amount_ariary: string;
  amount_crypto: string;
  wallet_address?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  client_name: string;
  phone_number: string;
  mobile_money_type?: string;
  wallet_lien?: string;
  wallet_name?: string;
}

export function DashboardContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get("/admin/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const totalRequests = transactions.length;
  const pendingRequests = transactions.filter((t) => t.status === "EN_ATTENTE").length;
  const completedRequests = transactions.filter((t) => t.status === "PAYE" || t.status === "TERMINE").length;
  const rejectedRequests = transactions.filter((t) => t.status === "REFUSE").length;

  const stats = [
    { label: "Total demandes", value: totalRequests.toString(), icon: FileText, color: "bg-primary/10 text-primary" },
    { label: "En attente", value: pendingRequests.toString(), icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Terminées", value: completedRequests.toString(), icon: CheckCircle2, color: "bg-success/10 text-success" },
    { label: "Refusées", value: rejectedRequests.toString(), icon: XCircle, color: "bg-destructive/10 text-destructive" },
  ];

  const recentRequests = transactions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((t) => {
      const amount = t.type === "ACHAT" 
        ? `${parseFloat(t.amount_ariary).toLocaleString()} Ar`
        : `${parseFloat(t.amount_crypto)} ${t.crypto}`;
      
      return {
        id: t.id,
        client: t.client_name,
        reference: t.reference,
        type: t.type,
        crypto: t.crypto,
        amount,
        status: t.status,
        wallet_lien: t.wallet_lien,
        wallet_name: t.wallet_name,
      };
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }
  return (
    <>
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble des activités
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div
              className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center mb-4`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-semibold">Demandes récentes</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/requests">Voir tout</Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucune demande pour le moment
            </div>
          ) : (
            recentRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
              <div>
                <p className="font-medium">{req.client}</p>
                <p className="text-sm text-muted-foreground">
                  {req.reference} • {req.type} {req.crypto}
                </p>
                {req.wallet_lien && (
                  <img src={req.wallet_lien} alt={req.wallet_name} className="h-10 w-10 rounded-full object-cover border" />
                )}
                {req.wallet_name && (
                  <p className="text-xs text-muted-foreground">{req.wallet_name}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium">{req.amount}</p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    req.status === "EN_ATTENTE"
                      ? "bg-warning/10 text-warning"
                      : req.status === "PAYE" || req.status === "TERMINE"
                      ? "bg-success/10 text-success"
                      : req.status === "REFUSE"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {req.status === "EN_ATTENTE" 
                    ? "En attente" 
                    : req.status === "PAYE" || req.status === "TERMINE"
                    ? "Terminé"
                    : req.status === "REFUSE"
                    ? "Refusé"
                    : req.status}
                </span>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
