import { useEffect, useState } from "react";
import { getCryptos } from "@/lib/api";

export type CryptoConfig = {
  id: string;
  symbol: string;
  name: string;
  buyRate: number;
  sellRate: number;
  networks: string[];
  color: string;
};

export const useCryptos = () => {
  const [cryptos, setCryptos] = useState<CryptoConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const data = await getCryptos();

        const formatted = data.map((c: any) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          buyRate: Number(c.buy_rate),
          sellRate: Number(c.sell_rate),
          networks: Array.isArray(c.networks)
            ? c.networks.filter(
                (network: unknown) =>
                  typeof network === "string" && network.trim().length > 0,
              )
            : [],
          color: c.color,
        }));

        setCryptos(formatted);
      } catch (error) {
        console.error("Erreur récupération cryptos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  return { cryptos, loading };
};
