import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ChevronDown,
  Eraser,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet,
  getCryptos,
  getWalletAddresses,
  replaceWalletAddresses,
} from "@/lib/api";

interface WalletAddress {
  id?: string;
  crypto_id: string;
  network: string;
  address: string;
}

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  networks: string[];
}

interface Wallet {
  id: string;
  lien: string;
  name: string;
  addresses: WalletAddress[];
  address?: string;
  created_at: string;
  updated_at: string | null;
}

const makeKey = (cryptoId: string, network: string) =>
  `${cryptoId}__${network ?? ""}`;

const parseKey = (key: string): { crypto_id: string; network: string } => {
  const sep = key.lastIndexOf("__");
  if (sep === -1) return { crypto_id: key, network: "" };
  return {
    crypto_id: key.slice(0, sep),
    network: key.slice(sep + 2),
  };
};

const networksOf = (crypto: Crypto): string[] =>
  crypto.networks && crypto.networks.length > 0 ? crypto.networks : [""];

/** Construit une entrée vide pour chaque couple (crypto, réseau),
 *  puis superpose les adresses existantes (création ET édition).
 *  Les adresses orphelines (réseau inconnu) sont conservées pour ne rien perdre. */
const initAddresses = (
  list: Crypto[],
  existing: WalletAddress[] = [],
): Record<string, string> => {
  const state: Record<string, string> = {};
  list.forEach((crypto) => {
    networksOf(crypto).forEach((network) => {
      state[makeKey(crypto.id, network)] = "";
    });
  });
  existing.forEach((addr) => {
    if (!addr.crypto_id) return;
    const key = makeKey(addr.crypto_id, addr.network ?? "");
    state[key] = addr.address ?? "";
  });
  return state;
};

export function WalletContent() {
  const { toast } = useToast();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({ lien: "", name: "" });

  // clé = "cryptoId__network" -> adresse saisie
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  const buildAddressBook = (walletList: Wallet[]) => {
    const book: Record<string, string> = {};
    walletList.forEach((wallet) => {
      if (editing && wallet.id === editing.id) return;
      (wallet.addresses ?? []).forEach((entry) => {
        if (!entry.crypto_id || !entry.address) return;
        const key = makeKey(entry.crypto_id, entry.network ?? "").toLowerCase();
        if (!book[key]) book[key] = entry.address;
      });
    });
    return book;
  };

  const addressBook = useMemo(
    () => buildAddressBook(wallets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallets, editing],
  );

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await getWallets();
      const enrichedWallets = await Promise.all(
        (data ?? []).map(async (wallet: Wallet) => {
          if (Array.isArray(wallet.addresses) && wallet.addresses.length > 0)
            return wallet;
          try {
            const raw = await getWalletAddresses(wallet.id);
            let addresses: WalletAddress[] = [];
            if (Array.isArray(raw)) {
              if (raw.length > 0 && raw[0]?.wallet_id) {
                addresses = raw.map((item) => ({
                  id: item.id,
                  crypto_id: item.crypto_id,
                  network: item.network ?? "",
                  address: item.address ?? "",
                }));
              }
              if (raw.length > 0 && Array.isArray(raw[0]?.addresses)) {
                const currentWallet = raw.find((item) => item.id === wallet.id);
                addresses = (currentWallet?.addresses ?? []).map((item: any) => ({
                  id: item.id,
                  crypto_id: item.crypto_id,
                  network: item.network ?? "",
                  address: item.address ?? "",
                }));
              }
            }
            return { ...wallet, addresses };
          } catch {
            return { ...wallet, addresses: [] };
          }
        }),
      );
      setWallets(enrichedWallets);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les wallets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
    const fetchCryptos = async () => {
      const data = await getCryptos();
      const list: Crypto[] = (data ?? []).map((c: any) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        networks: Array.isArray(c.networks) ? c.networks : [],
      }));
      setCryptos(list);
      // Garantit une entrée pour chaque nouveau couple (crypto, réseau)
      // sans écraser la saisie en cours.
      setAddresses((prev) => {
        const next = initAddresses(list);
        Object.entries(prev).forEach(([k, v]) => {
          if (k in next) next[k] = v;
          else if (v) next[k] = v; // conserve les orphelines déjà remplies
        });
        return next;
      });
    };
    fetchCryptos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm({ lien: "", name: "" });
    setAddresses(initAddresses(cryptos));
    setAddressSearch("");
    setCollapsed({});
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: "Nom requis", description: "Donnez un nom au wallet", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const payload = { name: form.name.trim(), lien: form.lien.trim() };
      const addressesPayload: WalletAddress[] = Object.entries(addresses)
        .map(([key, value]) => {
          const { crypto_id, network } = parseKey(key);
          return { crypto_id, network, address: (value ?? "").trim() };
        })
        .filter((item) => item.crypto_id && item.address !== "");

      let walletId = editing?.id ?? "";
      if (editing) {
        await updateWallet(editing.id, payload);
        await replaceWalletAddresses(editing.id, addressesPayload);
        toast({ title: "Succès", description: "Wallet mis à jour" });
      } else {
        const createdWallet = await createWallet(payload);
        walletId = createdWallet?.id ?? createdWallet?.data?.id ?? "";
        if (walletId) await replaceWalletAddresses(walletId, addressesPayload);
        toast({ title: "Créé", description: "Wallet ajouté" });
      }
      setOpen(false);
      setEditing(null);
      resetForm();
      fetchWallets();
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce wallet ?")) return;
    try {
      await deleteWallet(id);
      toast({ title: "Supprimé", description: "Wallet supprimé", variant: "destructive" });
      fetchWallets();
    } catch {
      toast({ title: "Erreur", description: "Suppression impossible", variant: "destructive" });
    }
  };

  const openEdit = (wallet: Wallet) => {
    setEditing(wallet);
    setForm({ lien: wallet.lien ?? "", name: wallet.name ?? "" });
    setAddresses(initAddresses(cryptos, wallet.addresses ?? []));
    setAddressSearch("");
    setCollapsed({});
    setOpen(true);
  };

  const filtered = wallets.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.lien.toLowerCase().includes(search.toLowerCase()),
  );

  const visibleCryptos = cryptos.filter(
    (c) =>
      c.symbol.toLowerCase().includes(addressSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(addressSearch.toLowerCase()),
  );

  const totalSlots = useMemo(
    () =>
      cryptos.reduce((sum, c) => sum + networksOf(c).length, 0),
    [cryptos],
  );

  const filledCount = useMemo(
    () => Object.values(addresses).filter((v) => (v ?? "").trim() !== "").length,
    [addresses],
  );

  const filledPerCrypto = useMemo(() => {
    const map: Record<string, number> = {};
    cryptos.forEach((c) => {
      map[c.id] = networksOf(c).filter(
        (n) => (addresses[makeKey(c.id, n)] ?? "").trim() !== "",
      ).length;
    });
    return map;
  }, [cryptos, addresses]);

  const getCryptoDetails = (cryptoId: string) => {
    const crypto = cryptos.find((item) => item.id === cryptoId);
    return crypto
      ? { symbol: crypto.symbol, name: crypto.name }
      : { symbol: "—", name: "Crypto inconnue" };
  };

  const toggleCollapse = (cryptoId: string) =>
    setCollapsed((prev) => ({ ...prev, [cryptoId]: !prev[cryptoId] }));

  /** Génère des initiales depuis le nom du wallet */
  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

  return (
    <>
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Wallets</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gérez vos portefeuilles crypto
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => { resetForm(); setEditing(null); setOpen(true); }}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter un wallet
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-5 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Aucun wallet trouvé
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-[28%]">
                  Wallet
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Adresses
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {filtered.map((wallet) => (
                <tr key={wallet.id} className="group hover:bg-muted/25 transition-colors">

                  {/* Wallet name + avatar */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-3">
                      {wallet.lien ? (
                        <img
                          src={wallet.lien}
                          alt={wallet.name}
                          className="h-9 w-9 rounded-lg object-cover border border-border/50 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg border border-border/50 bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
                          {getInitials(wallet.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm leading-none">{wallet.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                          {wallet.id.slice(0, 12)}…
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Addresses */}
                  <td className="px-4 py-3 align-top">
                    {wallet.addresses?.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {wallet.addresses.map((addr, i) => {
                          const crypto = getCryptoDetails(addr.crypto_id);
                          return (
                            <div
                              key={`${addr.crypto_id}-${addr.network}-${i}`}
                              className="flex flex-col gap-0.5 rounded-md border border-border/50 bg-muted/30 px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold leading-none">
                                  {crypto.symbol}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {addr.network || "—"}
                                </span>
                              </div>
                              <p className="font-mono text-[11px] text-muted-foreground break-all mt-0.5">
                                {addr.address}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start justify-end gap-1 pt-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEdit(wallet)}
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(wallet.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground text-right">
          {filtered.length} wallet{filtered.length > 1 ? "s" : ""}
        </p>
      )}

      {/* DIALOG — sans menu déroulant : une ligne par réseau, remplissage un à un */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/60">
            <DialogTitle className="text-base font-semibold">
              {editing ? "Modifier le wallet" : "Ajouter un wallet"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {filledCount}/{totalSlots} adresse{filledCount > 1 ? "s" : ""} renseignée{filledCount > 1 ? "s" : ""} — remplissez chaque réseau un à un, les champs vides sont ignorés.
            </p>
          </DialogHeader>

          <div className="overflow-y-auto px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Nom</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Binance"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Image (URL)</Label>
                <Input
                  value={form.lien}
                  onChange={(e) => setForm({ ...form, lien: e.target.value })}
                  placeholder="https://…"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Preview image */}
            {form.lien && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <img
                  src={form.lien}
                  alt="preview"
                  className="h-8 w-8 rounded-md border object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                Aperçu de l'image
              </div>
            )}

            {/* ADDRESSES — tout affiché, sans select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-medium">Adresses par crypto et par réseau</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setCollapsed(Object.fromEntries(cryptos.map((c) => [c.id, true])))}
                  >
                    Tout replier
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setCollapsed({})}
                  >
                    Tout déplier
                  </Button>
                  {filledCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => setAddresses(initAddresses(cryptos))}
                    >
                      <Eraser className="h-3 w-3 mr-1" />
                      Effacer
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Filtrer par crypto… (ex: BTC, Ethereum)"
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>

              {cryptos.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  Aucune crypto disponible.
                </p>
              ) : visibleCryptos.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  Aucune crypto ne correspond à « {addressSearch} ».
                </p>
              ) : (
                <div className="space-y-2.5">
                  {visibleCryptos.map((crypto) => {
                    const nets = networksOf(crypto);
                    const filled = filledPerCrypto[crypto.id] ?? 0;
                    const isCollapsed = !!collapsed[crypto.id];
                    return (
                      <div
                        key={crypto.id}
                        className={`rounded-lg border overflow-hidden transition-colors ${
                          filled > 0 ? "border-primary/40" : "border-border/60"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCollapse(crypto.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted/60 text-left"
                        >
                          <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-bold leading-none">
                            {crypto.symbol}
                          </span>
                          <span className="text-xs font-medium truncate flex-1">
                            {crypto.name}
                          </span>
                          <span
                            className={`text-[11px] tabular-nums ${
                              filled > 0 ? "text-primary font-semibold" : "text-muted-foreground"
                            }`}
                          >
                            {filled}/{nets.length}
                          </span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                              isCollapsed ? "-rotate-90" : ""
                            }`}
                          />
                        </button>

                        {!isCollapsed && (
                          <div className="divide-y divide-border/40">
                            {nets.map((network) => {
                              const key = makeKey(crypto.id, network);
                              const value = addresses[key] ?? "";
                              const isFilled = value.trim() !== "";
                              const suggestion =
                                !isFilled
                                  ? (addressBook[`${key}`.toLowerCase()] ?? "")
                                  : "";
                              return (
                                <div key={key} className="px-3 py-2 space-y-1.5 bg-card">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                      {network || "Réseau par défaut"}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {suggestion && (
                                        <button
                                          type="button"
                                          title={`Reprendre : ${suggestion}`}
                                          onClick={() =>
                                            setAddresses((prev) => ({ ...prev, [key]: suggestion }))
                                          }
                                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                                        >
                                          <Copy className="h-3 w-3" />
                                          Reprendre
                                        </button>
                                      )}
                                      {isFilled && (
                                        <button
                                          type="button"
                                          title="Effacer ce champ"
                                          onClick={() =>
                                            setAddresses((prev) => ({ ...prev, [key]: "" }))
                                          }
                                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                                        >
                                          <Eraser className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <Input
                                    placeholder={suggestion || `Adresse ${crypto.symbol}${network ? ` — ${network}` : ""}…`}
                                    value={value}
                                    onChange={(e) =>
                                      setAddresses((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    className={`h-9 text-sm font-mono placeholder:text-muted-foreground/50 ${
                                      isFilled ? "border-primary/40 bg-primary/[0.03]" : ""
                                    }`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-3 border-t border-border/60 bg-muted/20">
            <Button
              className="w-full h-9 text-sm font-medium"
              onClick={handleSubmit}
              disabled={saving || !form.name.trim()}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing
                ? `Mettre à jour (${filledCount} adresse${filledCount > 1 ? "s" : ""})`
                : `Créer le wallet (${filledCount} adresse${filledCount > 1 ? "s" : ""})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
