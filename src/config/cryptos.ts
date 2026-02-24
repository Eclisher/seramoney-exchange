export type CryptoConfig = {
  symbol: string;
  name: string;
  buyRate: number;
  sellRate: number;
  networks: string[];
  color: string;
};

export const CRYPTOS: CryptoConfig[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    buyRate: 460000000,
    sellRate: 450000000,
    networks: ["BTC"],
    color: "bg-orange-500",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    buyRate: 15000000,
    sellRate: 14800000,
    networks: ["ERC20"],
    color: "bg-indigo-500",
  },
  {
    symbol: "USDT",
    name: "Tether",
    buyRate: 4600,
    sellRate: 4500,
    networks: ["ERC20", "TRC20", "BEP20", "Polygon"],
    color: "bg-emerald-500",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    buyRate: 4600,
    sellRate: 4500,
    networks: ["ERC20", "Polygon", "Solana"],
    color: "bg-blue-500",
  },
  {
    symbol: "BNB",
    name: "BNB",
    buyRate: 1200000,
    sellRate: 1180000,
    networks: ["BEP20"],
    color: "bg-yellow-500",
  },
  {
    symbol: "SOL",
    name: "Solana",
    buyRate: 700000,
    sellRate: 680000,
    networks: ["Solana"],
    color: "bg-purple-500",
  },
  {
    symbol: "XRP",
    name: "XRP",
    buyRate: 2500,
    sellRate: 2400,
    networks: ["XRP"],
    color: "bg-slate-500",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    buyRate: 2200,
    sellRate: 2100,
    networks: ["Cardano"],
    color: "bg-blue-400",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    buyRate: 900,
    sellRate: 850,
    networks: ["DOGE"],
    color: "bg-yellow-400",
  },
  {
    symbol: "TRX",
    name: "Tron",
    buyRate: 550,
    sellRate: 530,
    networks: ["TRC20"],
    color: "bg-red-500",
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    buyRate: 460000,
    sellRate: 450000,
    networks: ["LTC"],
    color: "bg-gray-400",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    buyRate: 3000,
    sellRate: 2900,
    networks: ["Polygon"],
    color: "bg-purple-400",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    buyRate: 60000,
    sellRate: 58000,
    networks: ["ERC20"],
    color: "bg-blue-600",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    buyRate: 150000,
    sellRate: 145000,
    networks: ["Avalanche C-Chain"],
    color: "bg-red-600",
  },
  {
    symbol: "XLM",
    name: "Stellar",
    buyRate: 500,
    sellRate: 480,
    networks: ["Stellar"],
    color: "bg-cyan-500",
  },
];
