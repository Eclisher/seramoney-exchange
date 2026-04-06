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
import api, { getMyTransactions, getWallets, uploadTransactionImage } from "@/lib/api";
import { useCryptos, CryptoConfig } from "@/config/cryptos";
import {
  UserWalletPicker,
  PlatformWallet,
} from "@/components/wallets/UserWalletPicker";

const TOTAL_STEPS = 6;

type TxLite = {
  type?: string;
  created_at: string;
  status?: string;
  amount_ariary: string;
  id?: string;
  reference?: string;
};

export default function SellCrypto() {
  const { user } = useAuth();

  const { cryptos, loading } = useCryptos();
  const [crypto, setCrypto] = useState<CryptoConfig | null>(null);
  const [network, setNetwork] = useState<string>("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dailyUsedSell, setDailyUsedSell] = useState(0);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const [step, setStep] = useState(1);
  const [wallets, setWallets] = useState<PlatformWallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [createdTransactionId, setCreatedTransactionId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

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
  }, [step]);

  useEffect(() => {
    if (!loading && cryptos.length > 0 && !crypto) {
      setCrypto(cryptos[0]);
      setNetwork(cryptos[0].networks[0]);
    }
  }, [loading, cryptos, crypto]);

  useEffect(() => {
    const fetchDailyLimits = async () => {
      try {
        setIsLoadingLimits(true);
        const transactions = await getMyTransactions();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySellTransactions = (transactions as TxLite[]).filter((tx) => {
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
        todaySellTransactions.forEach((tx) => {
          totalAriary += parseFloat(tx.amount_ariary) || 0;
        });

        setDailyUsedSell(totalAriary);
      } catch (error: unknown) {
        console.error("Erreur lors de la récupération des limites:", error);
      } finally {
        setIsLoadingLimits(false);
      }
    };

    fetchDailyLimits();
  }, []);

  useEffect(() => {
    const loadWallets = async () => {
      try {
        setWalletsLoading(true);
        const data = await getWallets();
        setWallets(Array.isArray(data) ? data : []);
      } catch {
        setWallets([]);
      } finally {
        setWalletsLoading(false);
      }
    };
    loadWallets();
  }, []);

  const navigate = useNavigate();
  const { toast } = useToast();

  const amountAr = cryptoAmount
    ? (parseFloat(cryptoAmount) * (crypto?.sellRate ?? 0)).toLocaleString()
    : "0";

  const sellUsagePercent =
    DAILY_SELL_LIMIT > 0
      ? Math.min(100, (dailyUsedSell / DAILY_SELL_LIMIT) * 100)
      : 0;

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId) ?? null;

  const extractTransactionId = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return null;
    const root = payload as Record<string, unknown>;

    const candidates: Array<unknown> = [
      root.id,
      root.transaction_id,
      root.transactionId,
      root.transactionID,
      (root.transaction as any)?.id,
      (root.data as any)?.id,
      (root.data as any)?.transaction_id,
      (root.data as any)?.transactionId,
      (root.data as any)?.transaction?.id,
      (root.data as any)?.data?.id,
      (root.result as any)?.id,
    ];

    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c;
      if (typeof c === "number" && Number.isFinite(c)) return String(c);
    }
    return null;
  };

  const createTransactionIfNeeded = async () => {
    if (createdTransactionId) return createdTransactionId;
    if (!crypto) throw new Error("Crypto manquante");
    if (!selectedWalletId) throw new Error("Wallet manquant");

    const amountCryptoFloat = parseFloat(cryptoAmount);
    const amountAriaryFloat = parseFloat(amountAr.replace(/\s/g, ""));

    const response = await api.post("/transactions", {
      type: "VENTE",
      crypto: crypto.symbol,
      network,
      amount_crypto: amountCryptoFloat,
      amount_ariary: amountAriaryFloat,
      wallet_id: selectedWalletId,
      notes: "",
    });

    const id = extractTransactionId(response.data);
    const reference =
      typeof (response.data as { data?: { reference?: unknown } })?.data?.reference === "string"
        ? ((response.data as { data: { reference: string } }).data.reference as string)
        : null;

    if (!id) {
      if (reference) {
        const txs = (await getMyTransactions()) as TxLite[];
        const found = txs.find((t) => t.reference === reference);
        const fallbackId = found?.id ?? null;
        if (fallbackId) {
          setCreatedTransactionId(String(fallbackId));
          return String(fallbackId);
        }
      }

      console.error("Réponse création transaction (VENTE):", response.data);
      throw new Error(
        reference
          ? "Transaction créée, mais ID introuvable (référence non résolue)."
          : "Transaction créée, mais ID introuvable (voir console).",
      );
    }

    setCreatedTransactionId(String(id));
    return String(id);
  };

  const goNext = async () => {
    if (step === 1) {
      if (!crypto || !network) {
        toast({
          title: "Étape incomplète",
          description: "Choisissez une cryptomonnaie et un réseau.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      const amountCryptoFloat = parseFloat(cryptoAmount);
      if (isNaN(amountCryptoFloat) || amountCryptoFloat < 0.000001) {
        toast({
          title: "Montant invalide",
          description: "Le montant minimum est de 0.000001.",
          variant: "destructive",
        });
        return;
      }
      const amountAriaryFloat = parseFloat(amountAr.replace(/\s/g, ""));
      const totalAfterTransaction = dailyUsedSell + amountAriaryFloat;
      if (totalAfterTransaction > DAILY_SELL_LIMIT) {
        const remaining = DAILY_SELL_LIMIT - dailyUsedSell;
        toast({
          title: "Limite journalière atteinte",
          description: `Limite restante aujourd'hui : ${remaining > 0 ? remaining.toLocaleString() : 0} Ar.`,
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 3) {
      if (!selectedWalletId) {
        toast({
          title: "Moyen de paiement",
          description: "Sélectionnez un wallet pour recevoir votre paiement.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 4) {
      try {
        setCreatingTransaction(true);
        await createTransactionIfNeeded();
        toast({
          title: "Demande soumise",
          description: "Suivez les instructions puis envoyez la preuve.",
        });
      } catch (error: unknown) {
        toast({
          title: "Erreur",
          description:
            (typeof error === "object" &&
            error &&
            "response" in error &&
            typeof (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message === "string"
              ? (error as { response: { data: { message: string } } }).response.data.message
              : error instanceof Error
                ? error.message
                : "Création impossible"),
          variant: "destructive",
        });
        return;
      } finally {
        setCreatingTransaction(false);
      }
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Le flux est géré par les boutons "Suivant" et "Envoyer la preuve".
    return;
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
          <div className="mb-8 max-w-2xl space-y-4">
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
                            DAILY_SELL_LIMIT - dailyUsedSell,
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
                  Basé sur vos demandes de vente du jour (en attente, payées ou
                  terminées). Les limites sont réinitialisées toutes les 24h.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-2xl border bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-2">
                Étape {step} / {TOTAL_STEPS}
              </p>
              <div className="flex gap-1.5 max-w-md">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < step ? "bg-accent" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-6 min-h-[320px]">
              {step === 1 && (
                <>
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
                          {cryptos.map((c) => (
                            <button
                              key={c.symbol}
                              type="button"
                              onClick={() => {
                                setCrypto(c);
                                setNetwork(c.networks[0]);
                              }}
                              className={`min-w-[110px] p-4 rounded-xl border-2 transition-all duration-200 ${
                                crypto?.symbol === c.symbol
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
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cryptoAmount">Montant en {crypto.symbol}</Label>
                    <Input
                      id="cryptoAmount"
                      type="number"
                      step="0.000001"
                      placeholder="0.00"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
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
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-3">
                    <Label>Wallet de paiement</Label>
                    <p className="text-sm text-muted-foreground">
                      Choisissez le wallet (logo + nom) sur lequel vous souhaitez
                      recevoir les Ariary.
                    </p>
                    <UserWalletPicker
                      wallets={wallets}
                      loading={walletsLoading}
                      selectedId={selectedWalletId}
                      onSelect={setSelectedWalletId}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-start gap-3">
                      <Wallet className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">
                          Mobile Money associé
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">
                            {user?.phone_number ?? "—"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="space-y-4 text-sm">
                  <h3 className="font-semibold text-base">Récapitulatif</h3>
                  <ul className="space-y-2 rounded-xl border border-border p-4 bg-muted/20">
                    <li className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Crypto</span>
                      <span className="font-medium">
                        {crypto.symbol} ({network})
                      </span>
                    </li>
                    <li className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Montant vendu</span>
                      <span className="font-medium">
                        {cryptoAmount} {crypto.symbol}
                      </span>
                    </li>
                    <li className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Vous recevez</span>
                      <span className="font-medium text-accent">{amountAr} Ar</span>
                    </li>
                    <li className="flex justify-between gap-4 items-start">
                      <span className="text-muted-foreground shrink-0">
                        Paiement sur
                      </span>
                      <span className="font-medium text-right flex flex-col items-end gap-1">
                        {selectedWallet ? (
                          <>
                            <img
                              src={selectedWallet.lien}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover border"
                            />
                            {selectedWallet.name}
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </li>
                    <li className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Téléphone</span>
                      <span className="font-medium">{user?.phone_number ?? "—"}</span>
                    </li>
                  </ul>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Instructions</h3>
                  <div className="rounded-xl border p-4 bg-blue-500/5 border-blue-500/20">
                    <p className="text-sm text-muted-foreground">
                      Référence Binance / Numéro
                    </p>
                    <p className="font-mono text-lg font-semibold text-blue-600">
                      0346180946
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Après la transaction portefeuille, cliquez sur Suivant et envoyez la preuve.
                  </p>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Preuve (capture d'écran)</h3>
                  <div className="space-y-2">
                    <Label htmlFor="proof">Fichier</Label>
                    <Input
                      id="proof"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Formats images uniquement (PNG/JPG).
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-500">Comment ça marche ?</p>
                <p className="text-muted-foreground mt-1">
                  Après validation, vous recevrez l&apos;adresse wallet pour envoyer
                  vos cryptos. Le paiement Mobile Money sera effectué après
                  confirmation.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="sm:w-auto"
                  onClick={goPrev}
                  disabled={isLoading || creatingTransaction || uploadingProof}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
              )}
              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  className="flex-1"
                  onClick={goNext}
                  disabled={isLoading || creatingTransaction}
                >
                  {step === 4 && creatingTransaction ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Soumission...
                    </>
                  ) : (
                    <>
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  className="flex-1"
                  disabled={
                    isLoading ||
                    creatingTransaction ||
                    uploadingProof ||
                    !createdTransactionId ||
                    !proofFile
                  }
                  onClick={async () => {
                    if (!createdTransactionId || !proofFile) return;
                    try {
                      setUploadingProof(true);
                      await uploadTransactionImage({
                        transaction_id: createdTransactionId,
                        file: proofFile,
                        title: "Preuve",
                      });
                      setSuccess(true);
                      setTimeout(() => navigate("/history"), 1500);
                    } catch (err: unknown) {
                      toast({
                        title: "Erreur",
                        description:
                          (typeof err === "object" &&
                          err &&
                          "response" in err &&
                          typeof (err as { response?: { data?: { message?: string } } }).response
                            ?.data?.message === "string"
                            ? (err as { response: { data: { message: string } } }).response.data.message
                            : "Upload impossible"),
                        variant: "destructive",
                      });
                    } finally {
                      setUploadingProof(false);
                    }
                  }}
                >
                  {uploadingProof ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Upload...
                    </>
                  ) : (
                    <>
                      Envoyer la preuve
                      <ArrowDownRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
