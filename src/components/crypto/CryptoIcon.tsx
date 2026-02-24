import { cn } from "@/lib/utils";
import { CRYPTOS } from "@/config/cryptos";

interface CryptoIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-xl",
};

export function CryptoIcon({
  symbol,
  size = "md",
  className,
}: CryptoIconProps) {
  const crypto = CRYPTOS.find((c) => c.symbol === symbol);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shadow-md",
        crypto?.color,
        sizes[size],
        className,
      )}
    >
      {symbol}
    </div>
  );
}
