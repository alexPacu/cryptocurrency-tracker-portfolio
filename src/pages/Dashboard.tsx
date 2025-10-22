import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { StatCard } from "../components/StatCard";
import { CryptoTable } from "../components/CryptoTable";
import { Coin, fetchCoins } from "../lib/coingecko";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchCoins(currentPage, itemsPerPage);
      setCoins(data);
    } catch (error) {
      let errorMessage = "Failed to fetch cryptocurrency data";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("rate limit")) {
          errorMessage = "API rate limit reached. Please wait a minute and try again.";
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalMarketCap = coins.reduce((sum, coin) => sum + coin.market_cap, 0);
  const total24hVolume = coins.reduce((sum, coin) => sum + coin.total_volume, 0);
  const btcDominance = coins[0] ? ((coins[0].market_cap / totalMarketCap) * 100).toFixed(1) : "0.0";
  const activeCryptos = coins.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={() => {}} user={{}} onLogout={() => {}} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Market Cap" value="$1.2T" change="2.1%" isPositive={true} />
          <StatCard title="24h Volume" value="$88B" change="5.4%" isPositive={false} />
          <StatCard title="BTC Dominance" value={`${btcDominance}%`} change="0.8%" isPositive={true} />
          <StatCard title="Active Cryptos" value={activeCryptos.toLocaleString()} change="0.2%" isPositive={true} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Live Cryptocurrency Prices</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchData}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              <CryptoTable 
                coins={coins} 
                loading={loading} 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalPages={250 / itemsPerPage} // CoinGecko API has 250 coins maximum
              />
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
