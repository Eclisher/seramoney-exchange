import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, Loader2 } from "lucide-react";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(identifier, password);
      // Check if admin by email
      if (identifier.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
              <Wallet className="h-8 w-8 text-accent" />
            </div>
            <h1 className="font-display text-2xl font-bold">Connexion</h1>
            <p className="text-muted-foreground mt-2">
              Accédez à votre compte Seramoney
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-2xl bg-card border border-border">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="identifier">Email ou Numéro Mobile Money</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="email@exemple.com ou 034 12 345 67"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="accent" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>

            <div className="text-center text-sm">
              <Link to="/forgot-password" className="text-accent hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-accent font-medium hover:underline">
              S'inscrire
            </Link>
          </p>

          {/* Demo hint */}
          <div className="p-4 rounded-lg bg-muted text-sm text-center">
            <p className="text-muted-foreground">
              <strong>Démo:</strong> Utilisez n'importe quel email pour tester.
              <br />
              Ajoutez "admin" dans l'email pour accéder au Back Office.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
