import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ShieldCheck, LogIn } from "lucide-react";
import { toast } from "sonner";
import logoSera from "@/assets/logoSera.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/hooks/zodSchema";
import api from "@/lib/api";

const animatedButton =
  "group relative flex items-center justify-center gap-2 transition-all pr-8";

const animatedIcon =
  "opacity-0 translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error("Token manquant", {
        description: "Le lien de réinitialisation est invalide.",
      });
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setResetError("Token manquant");
      return;
    }

    setResetError(null);
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      
      toast.success("Mot de passe réinitialisé !", {
        description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de la réinitialisation";
      setResetError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-3">
                          <img
                            src={logoSera}
                            alt="Seramoney"
                            className="h-12 w-12 object-contain"
                          />
                          <span className="font-display text-4xl font-bold">
                            Sera<span className="text-accent">money</span>
                          </span>
              </Link>
            <h1 className="font-display text-2xl font-bold">
              Nouveau mot de passe
            </h1>
            <p className="text-sm text-muted-foreground">
              Choisissez un mot de passe sécurisé
            </p>
          </div>

          <div className="rounded-2xl border bg-muted p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
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

              <div className="space-y-2">
                <Label>Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    aria-label={
                      showConfirm
                        ? "Masquer la confirmation"
                        : "Afficher la confirmation"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {resetError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {resetError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                variant="accent"
                className={`w-full flex gap-2 ${animatedButton}`}
                disabled={isSubmitting || !token}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <span className="">Réinitialiser</span>
                    <LogIn className={`h-4 w-4 ${animatedIcon}`} />
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="text-accent hover:underline">
              Se connecter
            </Link>
          </p>

          <div className="mt-6 flex justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Mot de passe mis à jour
          </div>
        </div>
      </main>
    </div>
  );
}
