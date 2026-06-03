import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
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

export function WalletContent() {
  const { toast } = useToast();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);

  const [form, setForm] = useState({ lien: "", name: "" });

  const [addressesByCrypto, setAddressesByCrypto] = useState<
    Record<string, { network: string; address: string }>
  >({});

  const initAddressesForCryptos = (list: Crypto[]) => {
    const state: Record<string, { network: string; address: string }> = {};
    list.forEach((crypto) => {
      state[crypto.id] = { network: crypto.networks?.[0] ?? "", address: "" };
    });
    return state;
  };

  const buildAddressBook = (walletList: Wallet[]) => {
    const book: Record<string, string> = {};
    walletList.forEach((wallet) => {
      (wallet.addresses ?? []).forEach((entry) => {
        if (!entry.crypto_id || !entry.network || !entry.address) return;
        const key = `${entry.crypto_id}__${entry.network}`.toLowerCase();
        if (!book[key]) book[key] = entry.address;
      });
    });
    return book;
  };

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
      setCryptos(data);
      setAddressesByCrypto((prev) => {
        const initialized = initAddressesForCryptos(data);
        data.forEach((crypto) => {
          if (prev[crypto.id]) initialized[crypto.id] = prev[crypto.id];
        });
        return initialized;
      });
    };
    fetchCryptos();
  }, []);

  const resetForm = () => {
    setForm({ lien: "", name: "" });
    setAddressesByCrypto(initAddressesForCryptos(cryptos));
  };

  const handleSubmit = async () => {
    try {
      const payload = { name: form.name, lien: form.lien };
      const addressesPayload: WalletAddress[] = Object.entries(addressesByCrypto)
        .map(([crypto_id, values]) => ({
          crypto_id,
          network: values.network.trim(),
          address: values.address.trim(),
        }))
        .filter((item) => item.address !== "");

      let walletId = editing?.id ?? "";
      if (editing) {
        await updateWallet(editing.id, payload);
        await replaceWalletAddresses(editing.id, addressesPayload);
        toast({ title: "Succès", description: "Wallet mis à jour" });
      } else {
        const createdWallet = await createWallet(payload);
        walletId = createdWallet?.id;
        if (walletId) await replaceWalletAddresses(walletId, addressesPayload);
        toast({ title: "Créé", description: "Wallet ajouté" });
      }
      setOpen(false);
      setEditing(null);
      resetForm();
      fetchWallets();
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
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
    setForm({ lien: wallet.lien, name: wallet.name });
    const mapped = initAddressesForCryptos(cryptos);
    wallet.addresses?.forEach((addr) => {
      if (mapped[addr.crypto_id]) {
        mapped[addr.crypto_id] = { network: addr.network ?? "", address: addr.address ?? "" };
      }
    });
    setAddressesByCrypto(mapped);
    setOpen(true);
  };

  const filtered = wallets.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.lien.toLowerCase().includes(search.toLowerCase()),
  );

  const getCryptoDetails = (cryptoId: string) => {
    const crypto = cryptos.find((item) => item.id === cryptoId);
    return crypto
      ? { symbol: crypto.symbol, name: crypto.name }
      : { symbol: "—", name: "Crypto inconnue" };
  };

  const resolveSuggestedAddress = (cryptoId: string, network: string, walletList: Wallet[]) => {
    if (!network) return "";
    const key = `${cryptoId}__${network}`.toLowerCase();
    return buildAddressBook(walletList)[key] ?? "";
  };

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
                              key={`${addr.crypto_id}-${i}`}
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

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editing ? "Modifier le wallet" : "Ajouter un wallet"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
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

            {/* ADDRESSES */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Adresses par crypto</Label>

              {cryptos.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  Aucune crypto disponible.
                </p>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  {cryptos.map((crypto, idx) => (
                    <div
                      key={crypto.id}
                      className={`grid grid-cols-[80px_1fr_1fr] gap-0 ${
                        idx !== cryptos.length - 1 ? "border-b border-border/40" : ""
                      }`}
                    >
                      {/* Crypto label */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-r border-border/40">
                        <span className="text-xs font-semibold">{crypto.symbol}</span>
                      </div>

                      {/* Network select */}
                      <select
                        className="border-r border-border/40 px-2 py-2 bg-background text-sm text-foreground focus:outline-none focus:bg-muted/30"
                        value={addressesByCrypto[crypto.id]?.network ?? ""}
                        onChange={(e) => {
                          const nextNetwork = e.target.value;
                          const currentAddress = addressesByCrypto[crypto.id]?.address ?? "";
                          const suggested = resolveSuggestedAddress(crypto.id, nextNetwork, wallets);
                          setAddressesByCrypto((prev) => ({
                            ...prev,
                            [crypto.id]: {
                              ...(prev[crypto.id] ?? { network: "", address: "" }),
                              network: nextNetwork,
                              address: currentAddress || suggested,
                            },
                          }));
                        }}
                      >
                        {(crypto.networks ?? []).length === 0 ? (
                          <option value="">Aucun réseau</option>
                        ) : (
                          crypto.networks.map((network) => (
                            <option key={network} value={network}>
                              {network}
                            </option>
                          ))
                        )}
                      </select>

                      {/* Address input */}
                      <Input
                        placeholder="Adresse…"
                        value={addressesByCrypto[crypto.id]?.address ?? ""}
                        onChange={(e) =>
                          setAddressesByCrypto((prev) => ({
                            ...prev,
                            [crypto.id]: {
                              ...(prev[crypto.id] ?? { network: "", address: "" }),
                              address: e.target.value,
                            },
                          }))
                        }
                        className="rounded-none border-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-2 text-sm font-mono placeholder:text-muted-foreground/50"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full h-9 text-sm font-medium" onClick={handleSubmit}>
              {editing ? "Mettre à jour" : "Créer le wallet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}