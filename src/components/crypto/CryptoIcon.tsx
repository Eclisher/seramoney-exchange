import { cn } from "@/lib/utils";

interface CryptoIconProps {
  crypto: "USDT" | "BTC" | "TRX" | "LTC";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const cryptoColors = {
  USDT: "bg-emerald-500",
  BTC: "bg-orange-500",
  TRX: "bg-red-500",
  LTC: "bg-blue-400",
};

const cryptoSymbols = {
  USDT: "₮",
  BTC: "₿",
  TRX: "◈",
  LTC: "Ł",
};

const sizes = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-xl",
};

export function CryptoIcon({ crypto, size = "md", className }: CryptoIconProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shadow-md",
        cryptoColors[crypto],
        sizes[size],
        className
      )}
    >
      {cryptoSymbols[crypto]}
    </div>
  );
}

export function CryptoCard({ crypto, name, network }: { crypto: "USDT" | "BTC" | "TRX" | "LTC"; name: string; network: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-200 hover:shadow-md">
      <CryptoIcon crypto={crypto} size="lg" />
      <div>
        <h3 className="font-display font-semibold">{crypto}</h3>
        <p className="text-sm text-muted-foreground">{name}</p>
        <p className="text-xs text-accent">{network}</p>
      </div>
    </div>
  );
}
