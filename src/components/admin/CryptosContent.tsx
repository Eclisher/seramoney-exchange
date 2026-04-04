import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getCryptos,
  createCrypto,
  updateCrypto,
  deleteCrypto,
} from "@/lib/api";

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  buy_rate: string;
  sell_rate: string;
  color: string;
  is_active: boolean;
  networks: string[];
  created_at: string;
  updated_at: string | null;
}

export function CryptosContent() {
  const { toast } = useToast();
  const COLOR_OPTIONS = [
    { name: "Orange", class: "bg-orange-500" },
    { name: "Blue", class: "bg-blue-500" },
    { name: "Green", class: "bg-green-500" },
    { name: "Red", class: "bg-red-500" },
    { name: "Purple", class: "bg-purple-500" },
    { name: "Yellow", class: "bg-yellow-500" },
    { name: "Pink", class: "bg-pink-500" },
    { name: "Indigo", class: "bg-indigo-500" },
  ];  
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Crypto | null>(null);

  const [form, setForm] = useState({
    symbol: "",
    name: "",
    buy_rate: "",
    sell_rate: "",
    color: "",
    is_active: true,
    networks: "",
  });
  const fetchCryptos = async () => {
    try {
      setLoading(true);
      const data = await getCryptos();
      setCryptos(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les cryptos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptos();
  }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        networks: form.networks.split(",").map((n) => n.trim()),
      };

      if (editing) {
        await updateCrypto(editing.id, payload);
       toast({
         title: "Succès !",
         description: `${form.symbol} a été mise à jour avec succès.`,
         className: "bg-green-500 text-white border-none",
       });
      } else {
        await createCrypto(payload);
       toast({
         title: "Création réussie",
         description: `${form.symbol} est désormais disponible.`,
       });
      }

      setOpen(false);
      setEditing(null);
      resetForm();
      fetchCryptos();
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette crypto ?")) return;

    try {
      await deleteCrypto(id);
      toast({
        variant: "destructive",
        title: "Crypto supprimée",
        description: "Cryptosuppression réussie.",
      });
      fetchCryptos();
    } catch {
      toast({
        variant: "destructive",
        title: "Oups ! Une erreur est survenue",
        description: "Nous n'avons pas pu enregistrer les modifications.",
      });
    }
  };

  const resetForm = () => {
    setForm({
      symbol: "",
      name: "",
      buy_rate: "",
      sell_rate: "",
      color: "",
      is_active: true,
      networks: "",
    });
  };

  const openEdit = (crypto: Crypto) => {
    setEditing(crypto);
    setForm({
      symbol: crypto.symbol,
      name: crypto.name,
      buy_rate: crypto.buy_rate,
      sell_rate: crypto.sell_rate,
      color: crypto.color,
      is_active: crypto.is_active,
      networks: crypto.networks.join(", "),
    });
    setOpen(true);
  };

  const filtered = cryptos.filter(
    (c) =>
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Gestion des cryptomonnaies
          </h2>
          <p className="text-muted-foreground">
            Gérez les cryptos disponibles sur la plateforme
          </p>
        </div>

        <Button
          variant="accent"
          onClick={() => {
            resetForm();
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune cryptos disponible
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left text-sm">Crypto</th>
                <th className="p-4 text-left text-sm">Buy</th>
                <th className="p-4 text-left text-sm">Sell</th>
                <th className="p-4 text-left text-sm">Networks</th>
                <th className="p-4 text-left text-sm">Statut</th>
                <th className="p-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((crypto) => (
                <tr key={crypto.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${crypto.color}`}
                      >
                        {crypto.symbol}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {crypto.name}
                        </p>
                        <p className=" text-sm text-muted-foreground">{crypto.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {parseFloat(crypto.buy_rate).toLocaleString("fr-FR")} Ar
                  </td>
                  <td className="p-4">
                    {parseFloat(crypto.sell_rate).toLocaleString("fr-FR")} Ar
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {crypto.networks.join(", ")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        crypto.is_active
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {crypto.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(crypto)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(crypto.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier Crypto" : "Ajouter Crypto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Symbole</Label>
              <Input
                placeholder="Ex: BTC"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom de la cryptomonnaie</Label>
              <Input
                placeholder="Ex: Bitcoin"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Taux d'achat (Ariary)</Label>
              <Input
                type="number"
                placeholder="Ex: 460000000"
                value={form.buy_rate}
                onChange={(e) => setForm({ ...form, buy_rate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Taux de vente (Ariary)</Label>
              <Input
                type="number"
                placeholder="Ex: 450000000"
                value={form.sell_rate}
                onChange={(e) =>
                  setForm({ ...form, sell_rate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>

              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    type="button"
                    key={color.class}
                    onClick={() => setForm({ ...form, color: color.class })}
                    className={`
          h-10 w-10 rounded-full border-2 transition-all
          ${color.class}
          ${
            form.color === color.class
              ? "border-black scale-110"
              : "border-transparent"
          }
        `}
                  />
                ))}
              </div>

              {form.color && (
                <div className="flex items-center gap-3 mt-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${form.color}`}
                  >
                    {form.symbol || "?"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Couleur sélectionnée
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Réseaux disponibles</Label>
              <Input
                placeholder="Ex: BTC, ERC20"
                value={form.networks}
                onChange={(e) => setForm({ ...form, networks: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Séparer les réseaux par une virgule
              </p>
            </div>

            <Button className="w-full" variant="accent" onClick={handleSubmit}>
              {editing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
