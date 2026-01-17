    import { Link, useNavigate } from "react-router-dom";
  import { Button } from "@/components/ui/button";
  import { useTheme } from "@/contexts/ThemeContext";
  import { useAuth } from "@/contexts/AuthContext";
  import { Sun, Moon, Menu, X, Wallet, LogOut, User, LogIn } from "lucide-react";
  import { useState } from "react";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { scrollToId } from "@/lib/utils";

  export function Header() {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate("/");
    };
  const navLink =
    "relative text-lg font-nav text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full";
  const animatedButton =
      "group relative text-lg overflow-hidden flex items-center justify-center gap-2 transition-all";
const animatedIcon =
  "absolute right-0 opacity-0 -translate-x-4 group-hover:translate-x-2 group-hover:opacity-100 transition-all duration-300";

    return (
      <header
        className=" sticky top-0 z-50 w-full
        border-b border-border/40
        bg-background/70
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 text- items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-11 w-11 rounded-3xl overflow-hidden bg-primary/10 flex items-center justify-center">
              <img
                src="/src/assets/logoSera.png"
                alt="Seramoney"
                className="h-full w-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="font-display text-3xl font-bold tracking-tight">
              Sera<span className="text-accent">money</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => scrollToId("features")}
                  className={`${navLink}`}
                >
                  Fonctionnalités
                </button>
                <button
                  onClick={() => scrollToId("cryptos")}
                  className={`${navLink}`}
                >
                  Cryptos
                </button>
                <button
                  onClick={() => scrollToId("how-it-works")}
                  className={`${navLink}`}
                >
                  Comment ça marche
                </button>
              </>
            ) : (
              <>
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className="text-sm  font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tableau de bord
                </Link>
                {!isAdmin && (
                  <>
                    <Link
                      to="/buy"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Acheter
                    </Link>
                    <Link
                      to="/sell"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Vendre
                    </Link>
                    <Link
                      to="/history"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
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
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login" className={animatedButton}>
                    <span className="pl-4">Connexion</span>
                    <LogIn className={" h-4 w-4" + animatedIcon} />
                  </Link>
                </Button>
                <Button variant="accent" asChild>
                  <Link to="/register" className={animatedButton}>
                    <span className="pl-4">S'inscrire</span>
                    <User className={" h-4 w-4" + animatedIcon} />
                  </Link>
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
                    <Link
                      to={isAdmin ? "/admin" : "/dashboard"}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mon compte
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive"
                  >
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
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div
            className="
              md:hidden
              fixed inset-x-0 top-16 z-40
              border-t border-border
              bg-background/95 backdrop-blur-xl
              animate-slide-down
            "
          >
            <div className="container py-4 space-y-4">
              <div className="flex flex-row gap-3">
                <button
                  onClick={() => scrollToId("features")}
                  className={navLink}
                >
                  Fonctionnalités
                </button>
                <button
                  onClick={() => scrollToId("cryptos")}
                  className={navLink}
                >
                  Cryptos
                </button>
                <button
                  onClick={() => scrollToId("how-it-works")}
                  className={navLink}
                >
                  Comment ça marche
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Thème</span>
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {theme === "light" ? (
                    <Moon className="h-4 w-4 mr-2" />
                  ) : (
                    <Sun className="h-4 w-4 mr-2" />
                  )}
                  {theme === "light" ? "Sombre" : "Clair"}
                </Button>
              </div>

              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="h-full w-full items-center justify-center"
                  >
                    <Link
                      to="/login"
                      className="block  py-2 text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                  </Button>
                  <Button variant="accent" className="w-full" asChild>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to={isAdmin ? "/admin" : "/dashboard"}
                    className="block py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  {!isAdmin && (
                    <>
                      <Link
                        to="/buy"
                        className="block py-2 text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Acheter Crypto
                      </Link>
                      <Link
                        to="/sell"
                        className="block py-2 text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Vendre Crypto
                      </Link>
                      <Link
                        to="/history"
                        className="block py-2 text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Historique
                      </Link>
                    </>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
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
