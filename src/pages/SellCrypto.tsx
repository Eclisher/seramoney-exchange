import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownRight, Info, Loader2, CheckCircle2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Crypto = "USDT" | "BTC" | "TRX" | "LTC";
type Network = "TRC20" | "BEP20" | "BTC" | "LTC";

const rates: Record<Crypto, number> = {
  USDT: 4500,
  BTC: 450000000,
  TRX: 530,
  LTC: 450000,
};

const networkOptions: Record<Crypto, Network[]> = {
  USDT: ["TRC20", "BEP20"],
  BTC: ["BTC"],
  TRX: ["TRC20"],
  LTC: ["LTC"],
};

export default function SellCrypto() {
  const { user } = useAuth();
  const [crypto, setCrypto] = useState<Crypto>("USDT");
  const [network, setNetwork] = useState<Network>("TRC20");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const amountAr = cryptoAmount ? (parseFloat(cryptoAmount) * rates[crypto]).toLocaleString() : "0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setSuccess(true);
    toast({
      title: "Demande envoyée !",
      description: "Votre demande de vente a été soumise avec succès.",
    });

    setTimeout(() => {
      navigate("/history");
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center animate-fade-in">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Demande envoyée !</h1>
            <p className="text-muted-foreground">
              Votre demande sera traitée par un administrateur.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-blue-500" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Vendre Crypto</h1>
            </div>
            <p className="text-muted-foreground">
              Convertissez vos cryptomonnaies en Ariary
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
              {/* Crypto Selection */}
              <div className="space-y-2">
                <Label>Cryptomonnaie à vendre</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["USDT", "BTC", "TRX", "LTC"] as Crypto[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCrypto(c);
                        setNetwork(networkOptions[c][0]);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        crypto === c
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <CryptoIcon crypto={c} size="sm" className="mx-auto mb-2" />
                      <p className="font-semibold text-sm">{c}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Selection */}
              <div className="space-y-2">
                <Label>Réseau</Label>
                <Select value={network} onValueChange={(v: Network) => setNetwork(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networkOptions[crypto].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Crypto Amount */}
              <div className="space-y-2">
                <Label htmlFor="cryptoAmount">Montant en {crypto}</Label>
                <Input
                  id="cryptoAmount"
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                  required
                  min="0.000001"
                />
              </div>

              {/* Calculated Ariary Amount */}
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Vous recevrez environ</p>
                <p className="text-2xl font-bold text-accent">
                  {amountAr} Ar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Taux: 1 {crypto} = {rates[crypto].toLocaleString()} Ar
                </p>
              </div>

              {/* Mobile Money Info */}
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Paiement vers votre Mobile Money</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{user?.mobileMoneyType}</span>: {user?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-500">Comment ça marche ?</p>
                <p className="text-muted-foreground mt-1">
                  Après validation de votre demande, vous recevrez l'adresse wallet 
                  pour envoyer vos cryptos. Le paiement Mobile Money sera effectué 
                  après réception et confirmation.
                </p>
              </div>
            </div>

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Soumettre la demande
                  <ArrowDownRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
