import { Navbar } from "../components/Navbar";
import { StatCard } from "../components/StatCard";
import { CryptoTable } from "../components/CryptoTable";
import { Coin } from "../lib/coingecko";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

const MOCK_COINS: Coin[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 43250.00,
    market_cap: 845000000000,
    market_cap_rank: 1,
    total_volume: 28000000000,
    price_change_percentage_24h: 2.5,
    sparkline_in_7d: { price: [42000, 42500, 43000, 42800, 43100, 43500, 43250] }
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 2280.00,
    market_cap: 274000000000,
    market_cap_rank: 2,
    total_volume: 15000000000,
    price_change_percentage_24h: -1.2,
    sparkline_in_7d: { price: [2300, 2280, 2250, 2290, 2270, 2260, 2280] }
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    current_price: 1.00,
    market_cap: 95000000000,
    market_cap_rank: 3,
    total_volume: 45000000000,
    price_change_percentage_24h: 0.01,
    sparkline_in_7d: { price: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00] }
  }
];

export default function Dashboard() {
  const coins = MOCK_COINS;
  const totalMarketCap = 1214000000000;
  const total24hVolume = 88000000000;
  const btcDominance = "69.7";
  const activeCryptos = 3;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={() => {}} user={{}} onLogout={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Market Cap" value="$1.2T" change="2.1%" isPositive={true} />
          <StatCard title="24h Volume" value="$88B" change="5.4%" isPositive={false} />
          <StatCard title="BTC Dominance" value={`${btcDominance}%`} change="0.8%" isPositive={true} />
          <StatCard title="Active Cryptos" value={activeCryptos.toLocaleString()} change="0.2%" isPositive={true} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Cryptocurrency Prices</h2>
                <Button variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              <CryptoTable coins={coins} loading={false} />
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-bold">Portfolio Summary</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                  <p className="text-3xl font-bold">$12,345.67</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
                  <p className="text-2xl font-bold text-success">
                    $2,100.45 <span className="text-base">(+17.01%)</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall ROI</p>
                  <p className="text-2xl font-bold text-success">20.5%</p>
                </div>
                <Button className="w-full" size="lg">
                  View Detailed Portfolio
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
