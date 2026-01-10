import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Sun,
  Moon,
  Menu,
  Wallet,
  Eye,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: FileText, label: "Demandes", path: "/admin/requests" },
  { icon: Users, label: "Utilisateurs", path: "/admin/users" },
];

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobileMoneyType: string;
  totalTransactions: number;
  joinedDate: string;
}

const users: User[] = [
  { 
    id: "1", 
    name: "Jean Rakoto", 
    email: "jean@example.com", 
    phone: "034 12 345 67",
    mobileMoneyType: "MVola",
    totalTransactions: 5,
    joinedDate: "01/12/2023"
  },
  { 
    id: "2", 
    name: "Marie Rabe", 
    email: "marie@example.com", 
    phone: "032 98 765 43",
    mobileMoneyType: "OrangeMoney",
    totalTransactions: 3,
    joinedDate: "15/11/2023"
  },
  { 
    id: "3", 
    name: "Paul Andria", 
    email: "paul@example.com", 
    phone: "034 55 555 55",
    mobileMoneyType: "MVola",
    totalTransactions: 8,
    joinedDate: "20/10/2023"
  },
  { 
    id: "4", 
    name: "Lova Randriana", 
    email: "lova@example.com", 
    phone: "033 11 222 33",
    mobileMoneyType: "MVola",
    totalTransactions: 2,
    joinedDate: "05/01/2024"
  },
];

const userTransactions = [
  { id: "TXN001", type: "ACHAT", crypto: "USDT", amount: "100 000 Ar", status: "TERMINE", date: "10/01/2024" },
  { id: "TXN002", type: "VENTE", crypto: "BTC", amount: "0.001 BTC", status: "TERMINE", date: "08/01/2024" },
  { id: "TXN003", type: "ACHAT", crypto: "TRX", amount: "50 000 Ar", status: "EN_ATTENTE", date: "05/01/2024" },
];

export default function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery)
  );

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
            <h1 className="font-display text-lg font-semibold">Gestion des utilisateurs</h1>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-accent">{user?.name?.[0]}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Utilisateurs</h2>
              <p className="text-muted-foreground">Liste des clients inscrits</p>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-semibold text-sm">Nom</th>
                    <th className="text-left p-4 font-semibold text-sm">Contact</th>
                    <th className="text-left p-4 font-semibold text-sm">Mobile Money</th>
                    <th className="text-left p-4 font-semibold text-sm">Transactions</th>
                    <th className="text-left p-4 font-semibold text-sm">Inscrit le</th>
                    <th className="text-left p-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">{u.name[0]}</span>
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{u.email}</p>
                        <p className="text-sm text-muted-foreground">{u.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-accent/10 text-accent text-sm font-medium">
                          {u.mobileMoneyType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{u.totalTransactions}</span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {u.joinedDate}
                      </td>
                      <td className="p-4">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedUser(u)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
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
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Money</p>
                  <p className="font-medium">{selectedUser.mobileMoneyType}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Historique des transactions</h4>
                <div className="rounded-xl border border-border divide-y divide-border">
                  {userTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{tx.type} {tx.crypto}</p>
                        <p className="text-xs text-muted-foreground">{tx.id} • {tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{tx.amount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === "TERMINE" 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        }`}>
                          {tx.status === "TERMINE" ? "Terminé" : "En attente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
