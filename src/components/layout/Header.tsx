import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sun, Moon, Menu, X, Wallet, LogOut, User } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <img src="" alt="" />
            <Wallet className="h-5 w-5 text-accent" />
          </div>
          <span className="font-display text-xl font-bold">
            Sera<span className="text-accent">money</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <Link to="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </Link>
              <Link to="/#cryptos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cryptos
              </Link>
              <Link to="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Comment ça marche
              </Link>
            </>
          ) : (
            <>
              <Link to={isAdmin ? "/admin" : "/dashboard"} className="text-sm  font-medium text-muted-foreground hover:text-foreground transition-colors">
                Tableau de bord
              </Link>
              {!isAdmin && (
                <>
                  <Link to="/buy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Acheter
                  </Link>
                  <Link to="/sell" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Vendre
                  </Link>
                  <Link to="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Historique
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:flex"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button variant="accent" asChild>
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={isAdmin ? "/admin" : "/dashboard"} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mon compte
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up">
          <div className="container py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Thème</span>
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                {theme === "light" ? "Sombre" : "Clair"}
              </Button>
            </div>
            
            {!isAuthenticated ? (
              <>
                <Link to="/login"  className="block py-2 text-sm font-medium bg-" onClick={() => setMobileMenuOpen(false)}>
                  Connexion
                </Link>
                <Button variant="accent" className="w-full" asChild>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>S'inscrire</Link>
                </Button>
              </>
            ) : (
              <>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Tableau de bord
                </Link>
                {!isAdmin && (
                  <>
                    <Link to="/buy" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Acheter Crypto
                    </Link>
                    <Link to="/sell" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Vendre Crypto
                    </Link>
                    <Link to="/history" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Historique
                    </Link>
                  </>
                )}
                <Button variant="destructive" className="w-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
