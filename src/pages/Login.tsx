import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldCheck, LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import logoSera from "@/assets/logoSera.png";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/hooks/zodSchema";
const animatedButton =
  "group relative flex items-center justify-center gap-2 transition-all pr-8";

const animatedIcon =
  "opacity-0 translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300";

export default function Login() {
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const hasShownToast = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success("Connexion réussie !", {
        description: `Bienvenue ${user.full_name} !`,
        duration: 4000,
      });

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    if (loading) return;

    setLoginError(null);
    setLoading(true);

    try {
      await login(data.identifier, data.password);

      toast.success("Connexion réussie !");
    } catch (error: any) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Identifiants incorrects";

      setLoginError(message);

      toast.error("Erreur de connexion", {
        description: message,
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-3 justify-center"
            >
              <img
                src={logoSera}
                alt="Seramoney"
                className="h-12 w-12 object-contain"
              />
              <span className="font-display text-4xl font-bold">
                Sera<span className="text-accent">money</span>
              </span>
            </Link>

            <h1 className="font-display text-2xl font-bold">Connexion</h1>
            <p className="text-sm text-muted-foreground">
              Accédez à votre compte en toute sécurité
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Email ou numéro Mobile Money</Label>
                <Input
                  placeholder="email@exemple.com ou 034 12 345 67"
                  {...register("identifier")}
                />
                {errors.identifier && (
                  <p className="text-sm text-destructive">
                    {errors.identifier.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {loginError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                variant="accent"
                className={`w-full ${animatedButton}`}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <span className="">Se connecter</span>
                    <LogIn className={`h-4 w-4 ${animatedIcon}`} />
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <Link
                  to="/forgot-password"
                  className="text-blue-900 dark:text-accent hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-accent font-medium hover:underline"
            >
              S'inscrire
            </Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Connexion sécurisée – validation manuelle Seramoney
          </div>
        </div>
      </main>
    </div>
  );
}
