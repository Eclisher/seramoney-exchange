import { useRef, useState, useEffect } from "react";
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
import {
  ArrowDownRight,
  Info,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api, { getMyTransactions } from "@/lib/api";
import { CRYPTOS, CryptoConfig } from "@/config/cryptos";

export default function SellCrypto() {
  const { user } = useAuth();

  const [crypto, setCrypto] = useState<CryptoConfig>(CRYPTOS[0]);
  const [network, setNetwork] = useState<string>(CRYPTOS[0].networks[0]);
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dailyUsedSell, setDailyUsedSell] = useState(0);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const DAILY_SELL_LIMIT = 1000000;
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);

    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    const fetchDailyLimits = async () => {
      try {
        setIsLoadingLimits(true);
        const transactions = await getMyTransactions();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySellTransactions = transactions.filter((tx: any) => {
          if (tx.type !== "VENTE") return false;
          const txDate = new Date(tx.created_at);
          txDate.setHours(0, 0, 0, 0);
          return (
            txDate.getTime() === today.getTime() &&
            (tx.status === "EN_ATTENTE" ||
              tx.status === "PAYE" ||
              tx.status === "TERMINE")
          );
        });

        let totalAriary = 0;
        todaySellTransactions.forEach((tx: any) => {
          totalAriary += parseFloat(tx.amount_ariary) || 0;
        });

        setDailyUsedSell(totalAriary);
      } catch (error) {
        console.error("Erreur lors de la récupération des limites:", error);
      } finally {
        setIsLoadingLimits(false);
      }
    };

    fetchDailyLimits();
  }, []);

  const navigate = useNavigate();
  const { toast } = useToast();

  const amountAr = cryptoAmount
    ? (parseFloat(cryptoAmount) * crypto.sellRate).toLocaleString()
    : "0";

  const sellUsagePercent =
    DAILY_SELL_LIMIT > 0
      ? Math.min(100, (dailyUsedSell / DAILY_SELL_LIMIT) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const amountCryptoFloat = parseFloat(cryptoAmount);
      const amountAriaryFloat = parseFloat(amountAr.replace(/\s/g, ""));

      if (isNaN(amountCryptoFloat) || amountCryptoFloat < 0.000001) {
        toast({
          title: "Erreur",
          description: "Le montant minimum est de 0.000001",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const totalAfterTransaction = dailyUsedSell + amountAriaryFloat;
      if (totalAfterTransaction > DAILY_SELL_LIMIT) {
        const remaining = DAILY_SELL_LIMIT - dailyUsedSell;
        toast({
          title: "Limite journalière atteinte",
          description: `Vous avez déjà utilisé ${dailyUsedSell.toLocaleString()} Ar aujourd'hui. Limite restante: ${remaining > 0 ? remaining.toLocaleString() : 0} Ar. La limite de vente journalière est de ${DAILY_SELL_LIMIT.toLocaleString()} Ar.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const response = await api.post("/transactions", {
        type: "VENTE",
        crypto: crypto.symbol,
        network,
        amount_crypto: amountCryptoFloat,
        amount_ariary: amountAriaryFloat,
        notes: "",
      });

      setSuccess(true);
      toast({
        title: "Demande envoyée !",
        description:
          response.data.message ||
          "Votre demande de vente a été soumise avec succès.",
      });

      setTimeout(() => {
        navigate("/history");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de l'envoi de la demande";

      const isLimitError =
        errorMessage.toLowerCase().includes("limite") ||
        errorMessage.toLowerCase().includes("limit") ||
        errorMessage.toLowerCase().includes("daily") ||
        errorMessage.toLowerCase().includes("journalière") ||
        errorMessage.toLowerCase().includes("journalier") ||
        error.response?.status === 400;

      toast({
        title: isLimitError ? "Limite journalière atteinte" : "Erreur",
        description: isLimitError
          ? errorMessage.includes("limite") || errorMessage.includes("limit")
            ? errorMessage
            : `Limite journalière de vente atteinte. Maximum: ${DAILY_SELL_LIMIT.toLocaleString()} Ar par jour.`
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              Demande envoyée !
            </h1>
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
          <div className="container max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">

              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <ArrowDownRight className="h-5 w-5 text-blue-500" />
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  Vendre Crypto
                </h1>
              </div>
              <p className="text-muted-foreground">
                Convertissez vos cryptomonnaies en Ariary
              </p>
              <div className="p-6 rounded-2xl border bg-card">
                <h2 className="font-semibold text-lg mb-4">
                  📊 Votre limite de vente journalière
                </h2>
              </div>

                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <p className="font-medium text-blue-500">
                      Montant maximum par jour
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {DAILY_SELL_LIMIT.toLocaleString()} Ar
                    </p>

                    {isLoadingLimits ? (
                      <p className="text-xs text-muted-foreground mt-2">
                        Calcul de vos opérations du jour...
                      </p>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <p>
                          Utilisé aujourd&apos;hui:{" "}
                          <span className="font-medium text-foreground">
                            {dailyUsedSell.toLocaleString()} Ar
                          </span>
                        </p>
                        <p>
                          Restant pour aujourd&apos;hui:{" "}
                          <span className="font-medium text-foreground">
                            {Math.max(
                              0,
                              DAILY_SELL_LIMIT - dailyUsedSell
                            ).toLocaleString()}{" "}
                            Ar
                          </span>
                        </p>
                        <p>
                          Taux d&apos;utilisation:{" "}
                          <span className="font-medium text-foreground">
                            {sellUsagePercent.toFixed(0)}%
                          </span>{" "}
                          de votre limite de vente.
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-muted-foreground text-xs">
                    Basé sur vos demandes de vente du jour (en attente, payées
                    ou terminées). Les limites sont réinitialisées toutes les
                    24h.
                  </p>
                </div>
              </div>
            </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
              <div className="space-y-2">
                <Label>Cryptomonnaie à vendre</Label>
                <div className="space-y-2 relative">
                  <div className="relative">
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent z-0" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent z-0" />
                    {canScrollLeft && (
                      <button
                        type="button"
                        onClick={() => scroll("left")}
                        className="
                      absolute left-0 top-1/2 -translate-y-1/2 z-10
                      h-9 w-9 flex items-center justify-center
                      rounded-full
                      bg-background/80 backdrop-blur-md
                      border border-border
                      shadow-sm
                      hover:bg-accent hover:text-accent-foreground
                      transition-all duration-200
                    "
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}

                    <div
                      ref={scrollRef}
                      className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-hide"
                    >
                      {CRYPTOS.map((c) => (
                        <button
                          key={c.symbol}
                          type="button"
                          onClick={() => {
                            setCrypto(c);
                            setNetwork(c.networks[0]);
                          }}
                          className={`min-w-[110px] p-4 rounded-xl border-2 transition-all duration-200 ${
                            crypto.symbol === c.symbol
                              ? "border-accent bg-accent/5 scale-105"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          <CryptoIcon
                            symbol={c.symbol}
                            size="sm"
                            className="mx-auto mb-2"
                          />
                          <p className="font-semibold text-sm">{c.symbol}</p>
                        </button>
                      ))}
                    </div>
                    {canScrollRight && (
                      <button
                        type="button"
                        onClick={() => scroll("right")}
                        className="
                            absolute right-0 top-1/2 -translate-y-1/2 z-10
                            h-9 w-9 flex items-center justify-center
                            rounded-full
                            bg-background/80 backdrop-blur-md
                            border border-border
                            shadow-sm
                            hover:bg-accent hover:text-accent-foreground
                            transition-all duration-200
                          "
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Réseau</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {crypto.networks.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cryptoAmount">Montant en {crypto.symbol}</Label>
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

              <div className="p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground mb-1">
                  Vous recevrez environ
                </p>
                <p className="text-2xl font-bold text-accent">{amountAr} Ar</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Taux: 1 {crypto.symbol} = {crypto.sellRate.toLocaleString()}{" "}
                  Ar
                </p>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">
                      Paiement vers votre Mobile Money
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">
                        {user?.phone_number}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-500">Comment ça marche ?</p>
                <p className="text-muted-foreground mt-1">
                  Après validation, vous recevrez l'adresse wallet pour envoyer
                  vos cryptos. Le paiement Mobile Money sera effectué après
                  confirmation.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
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
