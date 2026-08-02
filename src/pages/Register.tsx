import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import logoSera from "@/assets/logoSera.png";
import { Loader2, ShieldCheck, LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/hooks/zodSchema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const animatedButton =
  "group relative flex items-center justify-center gap-2 transition-all pr-8";

const animatedIcon =
  "opacity-0 translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300";

export default function Register() {
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const hasShownToast = useRef(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (user && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success("Inscription réussie !", {
        description: `Bienvenue ${user.full_name} ! Votre compte a été créé avec succès.`,
        duration: 4000,
      });

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const onSubmit = async (data: RegisterFormValues) => {
    setRegisterError(null);
    hasShownToast.current = false;
    try {
      await registerUser({
        name: data.name,
        phone: data.phone,
        mobileMoneyType: data.mobileMoneyType,
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      setRegisterError(error.message || "Erreur lors de l'inscription");
      toast.error("Erreur d'inscription", {
        description: error.message || "Erreur lors de l'inscription",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl animate-fade-in">
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

            <h1 className="font-display text-2xl font-bold">Créer un compte</h1>
            <p className="text-sm text-muted-foreground">
              Inscription sécurisée – validation manuelle
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input placeholder="Jean Rakoto" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Numéro Mobile Money</Label>
                  <Input placeholder="034 12 345 67" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Type Mobile Money</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("mobileMoneyType", value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MVola">MVola</SelectItem>
                      <SelectItem value="OrangeMoney">Orange Money</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.mobileMoneyType && (
                    <p className="text-sm text-destructive">
                      {errors.mobileMoneyType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@exemple.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
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
              </div>

              {registerError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {registerError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                variant="accent"
                className={`w-full ${animatedButton}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <span className="">Créer un compte</span>
                    <LogIn className={`h-4 w-4 ${animatedIcon}`} />
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-accent font-medium hover:underline"
            >
              Se connecter
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Données protégées – Seramoney Exchange
          </div>
        </div>
      </main>
    </div>
  );
}
