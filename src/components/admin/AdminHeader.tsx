import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
  onLogout: () => void;
}

export function AdminHeader({ title, onMenuClick, onLogout }: AdminHeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-lg font-semibold truncate">{title}</h1>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Mode sombre" : "Mode clair"}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              aria-label="Déconnexion"
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop: User dropdown */}
          <div className="hidden lg:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-accent">
                      {user?.full_name?.[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium hidden xl:block">
                    {user?.full_name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "light" ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  {theme === "light" ? "Mode sombre" : "Mode clair"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile: User avatar only */}
          <div className="lg:hidden">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-accent">
                {user?.full_name?.[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
