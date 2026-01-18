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
  X,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: FileText, label: "Demandes", path: "/admin/requests" },
  { icon: Users, label: "Utilisateurs", path: "/admin/users" },
];

const stats = [
  { label: "Total demandes", value: "24", icon: FileText, color: "bg-primary/10 text-primary" },
  { label: "En attente", value: "5", icon: Clock, color: "bg-warning/10 text-warning" },
  { label: "Terminées", value: "18", icon: CheckCircle2, color: "bg-success/10 text-success" },
  { label: "Refusées", value: "1", icon: XCircle, color: "bg-destructive/10 text-destructive" },
];

const recentRequests = [
  { id: "TXN006", client: "Jean Rakoto", type: "ACHAT", crypto: "USDT", amount: "100 000 Ar", status: "EN_ATTENTE" },
  { id: "TXN007", client: "Marie Rabe", type: "VENTE", crypto: "BTC", amount: "0.002 BTC", status: "EN_ATTENTE" },
  { id: "TXN008", client: "Paul Andria", type: "ACHAT", crypto: "TRX", amount: "50 000 Ar", status: "PAYE" },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <Link
              to="/admin"
              className="inline-flex items-center gap-3 justify-center"
            >
              <img
                src="/src/assets/logoSera.png"
                alt="Seramoney"
                className="h-12 w-12 object-contain"
              />
              <span className="font-display text-white text-3xl font-bold">
                Sera<span className="text-accent">money</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
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

          {/* User & Theme */}
          <div className="p-4 border-t border-sidebar-border space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 mr-3" />
              ) : (
                <Sun className="h-5 w-5 mr-3" />
              )}
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
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
            <h1 className="font-display text-lg font-semibold">
              Administration
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-accent">
                  {user?.name?.[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
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

          {/* Recent Requests */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-semibold">Demandes récentes</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/requests">Voir tout</Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{req.client}</p>
                    <p className="text-sm text-muted-foreground">
                      {req.id} • {req.type} {req.crypto}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{req.amount}</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        req.status === "EN_ATTENTE"
                          ? "bg-warning/10 text-warning"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {req.status === "EN_ATTENTE" ? "En attente" : "Payé"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
