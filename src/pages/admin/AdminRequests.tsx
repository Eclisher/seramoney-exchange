import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Sun,
  Moon,
  Menu,
  Wallet,
  CheckCircle2,
  XCircle,
  Send,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: FileText, label: "Demandes", path: "/admin/requests" },
  { icon: Users, label: "Utilisateurs", path: "/admin/users" },
];

interface Request {
  id: string;
  client: string;
  phone: string;
  mobileMoneyType: string;
  type: "ACHAT" | "VENTE";
  crypto: "USDT" | "BTC" | "TRX" | "LTC";
  network: string;
  amountCrypto: string;
  amountAr: string;
  walletAddress?: string;
  status: "EN_ATTENTE" | "PAYE" | "CRYPTO_ENVOYEE" | "TERMINE" | "REFUSE";
  date: string;
}

const initialRequests: Request[] = [
  { 
    id: "TXN006", 
    client: "Jean Rakoto", 
    phone: "034 12 345 67",
    mobileMoneyType: "MVola",
    type: "ACHAT", 
    crypto: "USDT", 
    network: "TRC20",
    amountCrypto: "21.74",
    amountAr: "100 000",
    walletAddress: "TXyz...abc123",
    status: "EN_ATTENTE",
    date: "10/01/2024 14:30"
  },
  { 
    id: "TXN007", 
    client: "Marie Rabe", 
    phone: "032 98 765 43",
    mobileMoneyType: "OrangeMoney",
    type: "VENTE", 
    crypto: "BTC", 
    network: "BTC",
    amountCrypto: "0.002",
    amountAr: "900 000",
    status: "EN_ATTENTE",
    date: "10/01/2024 12:00"
  },
  { 
    id: "TXN008", 
    client: "Paul Andria", 
    phone: "034 55 555 55",
    mobileMoneyType: "MVola",
    type: "ACHAT", 
    crypto: "TRX", 
    network: "TRC20",
    amountCrypto: "90.91",
    amountAr: "50 000",
    walletAddress: "TQwer...xyz789",
    status: "PAYE",
    date: "09/01/2024 16:45"
  },
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

export default function AdminRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAction = (request: Request, action: string) => {
    setSelectedRequest(request);
    setActionType(action);
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    const newStatus = {
      validate_payment: "PAYE",
      send_crypto: "CRYPTO_ENVOYEE",
      complete: "TERMINE",
      refuse: "REFUSE",
    }[actionType] as Request["status"];

    setRequests(requests.map(r => 
      r.id === selectedRequest.id ? { ...r, status: newStatus } : r
    ));

    toast({
      title: "Action effectuée",
      description: `Statut mis à jour: ${statusLabels[newStatus]}`,
    });

    setSelectedRequest(null);
    setActionType("");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                <Wallet className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-sidebar-foreground">
                Sera<span className="text-sidebar-primary">money</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="h-5 w-5 mr-3" /> : <Sun className="h-5 w-5 mr-3" />}
              {theme === "light" ? "Mode sombre" : "Mode clair"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-lg font-semibold">Gestion des demandes</h1>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-accent">{user?.name?.[0]}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold">Demandes</h2>
            <p className="text-muted-foreground">Gérez les demandes d'achat et de vente</p>
          </div>

          {/* Requests Table */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-semibold text-sm">Client</th>
                    <th className="text-left p-4 font-semibold text-sm">Type</th>
                    <th className="text-left p-4 font-semibold text-sm">Crypto</th>
                    <th className="text-left p-4 font-semibold text-sm">Montant</th>
                    <th className="text-left p-4 font-semibold text-sm">Statut</th>
                    <th className="text-left p-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{req.client}</p>
                          <p className="text-sm text-muted-foreground">{req.phone}</p>
                          <p className="text-xs text-accent">{req.mobileMoneyType}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          req.type === "ACHAT" ? "bg-success/10 text-success" : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CryptoIcon crypto={req.crypto} size="sm" />
                          <div>
                            <p className="font-medium">{req.crypto}</p>
                            <p className="text-xs text-muted-foreground">{req.network}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{req.amountCrypto} {req.crypto}</p>
                        <p className="text-sm text-muted-foreground">{req.amountAr} Ar</p>
                        {req.walletAddress && (
                          <p className="text-xs text-muted-foreground font-mono">{req.walletAddress}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                          {statusLabels[req.status]}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {req.status === "EN_ATTENTE" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleAction(req, "validate_payment")}>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction(req, "refuse")}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </>
                          )}
                          {req.status === "PAYE" && (
                            <Button size="sm" variant="accent" onClick={() => handleAction(req, "send_crypto")}>
                              <Send className="h-4 w-4 mr-1" />
                              Crypto envoyée
                            </Button>
                          )}
                          {req.status === "CRYPTO_ENVOYEE" && (
                            <Button size="sm" variant="default" onClick={() => handleAction(req, "complete")}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Terminer
                            </Button>
                          )}
                          {(req.status === "TERMINE" || req.status === "REFUSE") && (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir effectuer cette action sur la demande {selectedRequest?.id} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Annuler
            </Button>
            <Button variant="accent" onClick={confirmAction}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
