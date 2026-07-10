import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import logoSera from "@/assets/logoSera.png";

import { useNotifications } from "@/contexts/NotificationContext";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Sun,
  Moon,
  Bitcoin,
  Wallet,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: FileText, label: "Demandes", path: "/admin/requests" },
  { icon: Users, label: "Utilisateurs", path: "/admin/users" },
  {icon: Bitcoin, label: "Cryptos", path: "/admin/cryptos" },
  {icon: Wallet, label: "Portefeuilles", path: "/admin/wallets" },
];

interface AdminSidebarProps {
  sidebarOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function AdminSidebar({ sidebarOpen, onClose, onLogout }: AdminSidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { unreadAdminCount, markAllAsRead  } = useNotifications();

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <Link
              to="/"
              className="inline-flex items-center gap-3 justify-center"
              onClick={onClose}
            >
              <img
                src={logoSera}
                alt="Seramoney"
                className="h-12 w-12 object-contain"
              />
              <span className="font-display text-white text-3xl font-bold">
                Sera<span className="text-accent">money</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const showBadge = item.path === "/admin/requests" && unreadAdminCount > 0;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                  onClick={() => {
                    if (item.path === "/admin/requests") {
                      markAllAsRead(); 
                    }
                    onClose();
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {showBadge && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadAdminCount > 99 ? "99+" : unreadAdminCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

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
              onClick={onLogout}
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
          onClick={onClose}
        />
      )}
    </>
  );
}
