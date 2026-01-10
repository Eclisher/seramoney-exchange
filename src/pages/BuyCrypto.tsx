import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, Info, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Crypto = "USDT" | "BTC" | "TRX" | "LTC";
type Network = "TRC20" | "BEP20" | "BTC" | "LTC";

const rates: Record<Crypto, number> = {
  USDT: 4600,
  BTC: 460000000,
  TRX: 550,
  LTC: 460000,
};

const networkOptions: Record<Crypto, Network[]> = {
  USDT: ["TRC20", "BEP20"],
  BTC: ["BTC"],
  TRX: ["TRC20"],
  LTC: ["LTC"],
};

export default function BuyCrypto() {
  const [crypto, setCrypto] = useState<Crypto>("USDT");
  const [network, setNetwork] = useState<Network>("TRC20");
  const [amountAr, setAmountAr] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const cryptoAmount = amountAr ? (parseFloat(amountAr) / rates[crypto]).toFixed(6) : "0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setSuccess(true);
    toast({
      title: "Demande envoyée !",
      description: "Votre demande d'achat a été soumise avec succès.",
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
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-success" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Acheter Crypto</h1>
            </div>
            <p className="text-muted-foreground">
              Achetez des cryptomonnaies avec Mobile Money
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
              {/* Crypto Selection */}
              <div className="space-y-2">
                <Label>Cryptomonnaie</Label>
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

              {/* Amount in Ariary */}
              <div className="space-y-2">
                <Label htmlFor="amount">Montant en Ariary</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100 000"
                  value={amountAr}
                  onChange={(e) => setAmountAr(e.target.value)}
                  required
                  min="10000"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum: 10 000 Ar
                </p>
              </div>

              {/* Calculated Crypto Amount */}
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Vous recevrez environ</p>
                <p className="text-2xl font-bold text-accent">
                  {cryptoAmount} {crypto}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Taux: 1 {crypto} = {rates[crypto].toLocaleString()} Ar
                </p>
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="wallet">Adresse Wallet ({network})</Label>
                <Input
                  id="wallet"
                  type="text"
                  placeholder="Entrez votre adresse de portefeuille"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Adresse Binance ou autre portefeuille compatible {network}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex gap-3">
              <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent">Information importante</p>
                <p className="text-muted-foreground mt-1">
                  Après validation de votre demande, vous recevrez les instructions 
                  pour effectuer le paiement Mobile Money. Les cryptos seront envoyées 
                  après confirmation du paiement.
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
                  <ArrowUpRight className="h-4 w-4" />
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
