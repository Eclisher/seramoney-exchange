import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ShieldCheck, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};
const animatedButton =
  "group relative flex items-center justify-center gap-2 transition-all pr-8";

const animatedIcon =
  "opacity-0 translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordForm>();

  const onSubmit = async (data: ResetPasswordForm) => {
    if (data.password !== data.confirmPassword) return;

    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-3">
                          <img
                            src="/src/assets/logoSera.png"
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
              {[
                {
                  label: "Nouveau mot de passe",
                  show: showPassword,
                  toggle: setShowPassword,
                  field: "password",
                },
                {
                  label: "Confirmer le mot de passe",
                  show: showConfirm,
                  toggle: setShowConfirm,
                  field: "confirmPassword",
                },
              ].map((item) => (
                <div key={item.field} className="space-y-2">
                  <Label>{item.label}</Label>
                  <div className="relative">
                    <Input
                      type={item.show ? "text" : "password"}
                      {...register(item.field as any, { required: true })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => item.toggle((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {item.show ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

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
