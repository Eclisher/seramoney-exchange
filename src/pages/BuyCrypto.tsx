import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import {
  ArrowUpRight,
  Info,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api, { getMyTransactions } from "@/lib/api";
import { useCryptos, CryptoConfig } from "@/config/cryptos";

export default function BuyCrypto() {
  const { cryptos, loading } = useCryptos();
  const [crypto, setCrypto] = useState<CryptoConfig | null>(null);
  const [network, setNetwork] = useState<string>("");
  const [amountAr, setAmountAr] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dailyUsedBuy, setDailyUsedBuy] = useState(0);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const DAILY_BUY_LIMIT_USDT = 200;
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };
  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 150;

    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
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

  // set initial crypto once data is available
  useEffect(() => {
    if (!loading && cryptos.length > 0 && !crypto) {
      setCrypto(cryptos[0]);
      setNetwork(cryptos[0].networks[0]);
    }
  }, [loading, cryptos, crypto]);

  useEffect(() => {
    if (loading || cryptos.length === 0) return;

    const fetchDailyLimits = async () => {
      try {
        setIsLoadingLimits(true);
        const transactions = await getMyTransactions();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayBuyTransactions = transactions.filter((tx: any) => {
          if (tx.type !== "ACHAT") return false;
          const txDate = new Date(tx.created_at);
          txDate.setHours(0, 0, 0, 0);
          return (
            txDate.getTime() === today.getTime() &&
            (tx.status === "EN_ATTENTE" ||
              tx.status === "PAYE" ||
              tx.status === "TERMINE")
          );
        });
        const usdtConfig = cryptos.find((c) => c.symbol === "USDT");
        let totalUSDT = 0;
        if (usdtConfig) {
          todayBuyTransactions.forEach((tx: any) => {
            const amountInUSDT =
              parseFloat(tx.amount_ariary) / usdtConfig.buyRate;
            totalUSDT += amountInUSDT;
          });
        }

        setDailyUsedBuy(totalUSDT);
      } catch (error) {
        console.error("Erreur lors de la récupération des limites:", error);
      } finally {
        setIsLoadingLimits(false);
      }
    };

    fetchDailyLimits();
  }, [loading, cryptos]);

  const navigate = useNavigate();
  const { toast } = useToast();

  const cryptoAmount =
    amountAr && crypto
      ? (parseFloat(amountAr) / crypto.buyRate).toFixed(6)
      : "0";

  const buyUsagePercent =
    DAILY_BUY_LIMIT_USDT > 0
      ? Math.min(100, (dailyUsedBuy / DAILY_BUY_LIMIT_USDT) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const amountAriaryFloat = parseFloat(amountAr);
      const amountCryptoFloat = parseFloat(cryptoAmount);

      if (isNaN(amountAriaryFloat) || amountAriaryFloat < 10000) {
        toast({
          title: "Erreur",
          description: "Le montant minimum est de 10 000 Ar",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const usdtConfig = cryptos.find((c) => c.symbol === "USDT");
      if (usdtConfig) {
        const amountInUSDT = amountAriaryFloat / usdtConfig.buyRate;
        const totalAfterTransaction = dailyUsedBuy + amountInUSDT;

        if (totalAfterTransaction > DAILY_BUY_LIMIT_USDT) {
          const remaining = DAILY_BUY_LIMIT_USDT - dailyUsedBuy;
          toast({
            title: "Limite journalière atteinte",
            description: `Vous avez déjà utilisé ${dailyUsedBuy.toFixed(2)} USDT aujourd'hui. Limite restante: ${remaining > 0 ? remaining.toFixed(2) : 0} USDT. La limite d'achat journalière est de ${DAILY_BUY_LIMIT_USDT} USDT.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const response = await api.post("/transactions", {
        type: "ACHAT",
        crypto: crypto.symbol,
        network,
        amount_ariary: amountAriaryFloat,
        amount_crypto: amountCryptoFloat,
        wallet_address: walletAddress,
        notes: "",
      });

      setSuccess(true);
      toast({
        title: "Demande envoyée !",
        description:
          response.data.message ||
          "Votre demande d'achat a été soumise avec succès.",
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
            : `Limite journalière d'achat atteinte. Maximum: ${DAILY_BUY_LIMIT_USDT} USDT par jour.`
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !crypto) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

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
                  <ArrowUpRight className="h-5 w-5 text-blue-500" />
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  Acheter Crypto
                </h1>
              </div>
              <p className="text-muted-foreground">
                Achetez des cryptomonnaies avec Mobile Money
              </p>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border bg-card">
                  <h2 className="font-semibold text-lg mb-4">
                    📊 Votre limite d&apos;achat journalière
                  </h2>

                  <div className="space-y-4 text-sm">
                    <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                      <p className="font-medium text-success">
                        Montant maximum par jour
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {DAILY_BUY_LIMIT_USDT.toLocaleString()} USDT
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
                              {dailyUsedBuy.toFixed(2)} USDT
                            </span>
                          </p>
                          <p>
                            Restant pour aujourd&apos;hui:{" "}
                            <span className="font-medium text-foreground">
                              {Math.max(
                                0,
                                DAILY_BUY_LIMIT_USDT - dailyUsedBuy,
                              ).toFixed(2)}{" "}
                              USDT
                            </span>
                          </p>
                          <p>
                            Taux d&apos;utilisation:{" "}
                            <span className="font-medium text-foreground">
                              {buyUsagePercent.toFixed(0)}%
                            </span>{" "}
                            de votre limite d&apos;achat.
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-muted-foreground text-xs">
                      Basé sur vos demandes d&apos;achat du jour (en attente,
                      payées ou terminées). Les limites sont réinitialisées
                      toutes les 24h.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
              <div className="space-y-2 relative">
                <Label>Cryptomonnaie</Label>
                <div className="relative">
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
                    {loading ? (
                      <div className="w-full text-center py-6 text-sm text-muted-foreground">
                        Chargement...
                      </div>
                    ) : (
                      cryptos.map((c) => (
                        <button
                          key={c.symbol}
                          type="button"
                          onClick={() => {
                            setCrypto(c);
                            setNetwork(c.networks[0]);
                          }}
                          className={`min-w-[110px] p-4 rounded-xl border-2 transition-all ${
                            crypto?.symbol === c.symbol
                              ? "border-accent bg-accent/5"
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
                      ))
                    )}
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
                <Label htmlFor="amount">Montant en Ariary</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100000"
                  value={amountAr}
                  onChange={(e) => setAmountAr(e.target.value)}
                  required
                  min="10000"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum: 10 000 Ar
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground mb-1">
                  Vous recevrez environ
                </p>
                <p className="text-2xl font-bold text-accent">
                  {cryptoAmount} {crypto.symbol}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Taux: 1 {crypto.symbol} = {crypto.buyRate.toLocaleString()} Ar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet">Adresse Wallet ({network})</Label>
                <Input
                  id="wallet"
                  type="text"
                  placeholder="Entrez votre adresse"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex gap-3">
              <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent">
                  Information importante
                </p>
                <p className="text-muted-foreground mt-1">
                  Après validation, vous recevrez les instructions de paiement.
                  Les cryptos seront envoyées après confirmation.
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
