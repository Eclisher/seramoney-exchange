import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import logoSera from "@/assets/logoSera.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/hooks/zodSchema";
import api from "@/lib/api";

const animatedButton =
  "group relative flex items-center justify-center gap-2 transition-all pr-8";

const animatedIcon =
  "opacity-0 translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300";

export default function ForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await api.post("/auth/forgot-password", {
        email: data.email,
      });
      setIsSuccess(true);
      toast.success("Email envoyé !", {
        description:
          "Vérifiez votre boîte de réception pour le lien de réinitialisation.",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de l'envoi de l'email";
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
              Mot de passe oublié
            </h1>
            <p className="text-sm text-muted-foreground">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          <div className="rounded-2xl border bg-muted p-8">
            {isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email envoyé !</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vérifiez votre boîte de réception. Un lien de
                    réinitialisation vous a été envoyé.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsSuccess(false)}
                  className="w-full"
                >
                  Envoyer un autre email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="rakoto@gmail.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="accent"
                  className={`w-full flex gap-2 ${animatedButton}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <span className="">Réinitialiser</span>
                      <Mail className={`h-4 w-4 ${animatedIcon}`} />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="text-accent hover:underline">
              Retour à la connexion
            </Link>
          </p>

          <div className="mt-6 flex justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Réinitialisation sécurisée
          </div>
        </div>
      </main>
    </div>
  );
}
