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
} from "@/lib/api";

interface Wallet {
  id: string;
  lien: string;
  name: string;
  address: string; // ← renommé
  created_at: string;
  updated_at: string | null;
}

export function WalletContent() {
  const { toast } = useToast();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);

  const [form, setForm] = useState({
    lien: "",
    name: "",
    address: "", // ← renommé
  });

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await getWallets();
      setWallets(data);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les wallets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateWallet(editing.id, form);
        toast({ title: "Succès", description: "Wallet mis à jour" });
      } else {
        await createWallet(form);
        toast({ title: "Créé", description: "Wallet ajouté" });
      }
      setOpen(false);
      setEditing(null);
      resetForm();
      fetchWallets();
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce wallet ?")) return;
    try {
      await deleteWallet(id);
      toast({
        title: "Supprimé",
        description: "Wallet supprimé",
        variant: "destructive",
      });
      fetchWallets();
    } catch {
      toast({
        title: "Erreur",
        description: "Suppression impossible",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setForm({ lien: "", name: "", address: "" });
  };

  const openEdit = (wallet: Wallet) => {
    setEditing(wallet);
    setForm({ lien: wallet.lien, name: wallet.name, address: wallet.address });
    setOpen(true);
  };

  const filtered = wallets.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.lien.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Wallets</h2>
          <p className="text-muted-foreground">Gérez les portefeuilles</p>
        </div>
        <Button
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">Aucun wallet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Nom</th>
                <th className="p-4 text-left">Lien</th>
                <th className="p-4 text-left">Adresses</th>
                {/* ← renommé */}
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wallet) => (
                <tr key={wallet.id} className="border-b hover:bg-muted/30">
                  <td className="p-4 font-medium">{wallet.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={wallet.lien}
                        alt={wallet.name}
                        className="h-12 w-12 rounded-lg object-cover border"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs">
                    {/* Affiche chaque adresse sur une ligne */}
                    {wallet.address
                      ? wallet.address.split(",").map((addr, i) => (
                          <div key={i} className="font-mono text-xs truncate">
                            {addr.trim()}
                          </div>
                        ))
                      : "—"}
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(wallet)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(wallet.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
              {editing ? "Modifier Wallet" : "Ajouter Wallet"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Lien (image)</Label>
              <Input
                value={form.lien}
                onChange={(e) => setForm({ ...form, lien: e.target.value })}
              />
            </div>
            <div>
              <Label>Adresses (séparées par des virgules)</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="0xABC..., 0xDEF..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Entrez une ou plusieurs adresses séparées par <code>,</code>
              </p>
            </div>
            <Button className="w-full" onClick={handleSubmit}>
              {editing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
