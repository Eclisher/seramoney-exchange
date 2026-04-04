import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface PlatformWallet {
  id: string;
  lien: string;
  name: string;
  description: string;
}

interface UserWalletPickerProps {
  wallets: PlatformWallet[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyMessage?: string;
}

export function UserWalletPicker({
  wallets,
  loading,
  selectedId,
  onSelect,
  emptyMessage = "Aucun moyen de paiement disponible pour le moment.",
}: UserWalletPickerProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {wallets.map((w) => (
        <button
          key={w.id}
          type="button"
          onClick={() => onSelect(w.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
            selectedId === w.id
              ? "border-accent bg-accent/5 shadow-sm"
              : "border-border hover:border-accent/40",
          )}
        >
          <div className="h-14 w-14 rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={w.lien}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <span className="text-xs font-semibold leading-tight line-clamp-2">{w.name}</span>
        </button>
      ))}
    </div>
  );
}
