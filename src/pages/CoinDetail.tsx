import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";
import { fetchCoinDetails } from "@/lib/coingecko";
import { useToast } from "@/hooks/use-toast";

export default function CoinDetail() {
  const { id } = useParams();
  const [coin, setCoin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("1D");
  const { toast } = useToast();

  useEffect(() => {
    loadCoinDetails();
  }, [id]);

  const loadCoinDetails = async () => {
    try {
      const data = await fetchCoinDetails(id!);
      setCoin(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load coin details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={{}} onLogout={() => {}} showSearch={false} />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={{}} onLogout={() => {}} showSearch={false} />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">Coin not found</p>
        </div>
      </div>
    );
  }

  const isPositive = coin.market_data.price_change_percentage_24h > 0;
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const newsItems = [
    {
      title: `${coin.name} Reaches New All-Time High`,
      source: "CoinDesk",
      time: "2 hours ago",
    },
    {
      title: `Institutional Adoption of ${coin.name} on the Rise`,
      source: "Reuters",
      time: "5 hours ago",
    },
    {
      title: `What's Next for ${coin.name} Price? Analysts Weigh In`,
      source: "Bloomberg Crypto",
      time: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={{}} onLogout={() => {}} showSearch={false} />

      <main className="container mx-auto px-4 py-8">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <img src={coin.image.large} alt={coin.name} className="h-16 w-16" />
          <div>
            <h1 className="text-4xl font-bold">
              {coin.name} ({coin.symbol.toUpperCase()})
            </h1>
            <div className="mt-2 flex items-center gap-4">
              <p className="text-3xl font-bold">
                ${coin.market_data.current_price.usd.toLocaleString()}
              </p>
              <div
                className={`flex items-center gap-1 text-lg font-medium ${
                  isPositive ? "text-success" : "text-destructive"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                {isPositive ? "+" : ""}
                {coin.market_data.price_change_percentage_24h.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard
            title="Market Cap"
            value={formatNumber(coin.market_data.market_cap.usd)}
            change={`${coin.market_data.market_cap_change_percentage_24h.toFixed(1)}%`}
            isPositive={coin.market_data.market_cap_change_percentage_24h > 0}
          />
          <StatCard
            title="24h Volume"
            value={formatNumber(coin.market_data.total_volume.usd)}
          />
          <StatCard
            title="24h Change"
            value={`${isPositive ? "+" : ""}${coin.market_data.price_change_percentage_24h.toFixed(2)}%`}
            isPositive={isPositive}
          />
        </div>

        <Card className="mb-8 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Price Chart</h2>
            <div className="flex gap-2">
              {["1D", "7D", "1M", "1Y", "All"].map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
          <div className="h-[400px] flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d="M 0 350 Q 100 300 200 250 T 400 200 Q 500 150 600 100 T 800 180 Q 900 220 1000 150 L 1000 400 L 0 400 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 0 350 Q 100 300 200 250 T 400 200 Q 500 150 600 100 T 800 180 Q 900 220 1000 150"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
              />
            </svg>
          </div>
        </Card>

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <Card className="p-6">
              <div className="space-y-4">
                {newsItems.map((item, i) => (
                  <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium hover:text-primary cursor-pointer">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.source} - {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: coin.description.en }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Official Links</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {coin.links.homepage.filter((link: string) => link).map((link: string, i: number) => (
                      <Button key={i} variant="outline" size="sm" asChild>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          Website
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Community</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Twitter Followers:{" "}
                      <span className="font-medium text-foreground">
                        {coin.community_data?.twitter_followers?.toLocaleString() || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reddit Subscribers:{" "}
                      <span className="font-medium text-foreground">
                        {coin.community_data?.reddit_subscribers?.toLocaleString() || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
