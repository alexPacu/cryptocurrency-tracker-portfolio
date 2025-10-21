import { useState } from "react";
import { Coin } from "@/lib/coingecko";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoTableProps {
  coins: Coin[];
  loading?: boolean;
}

export const CryptoTable = ({ coins, loading }: CryptoTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(coins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoins = coins.slice(startIndex, endIndex);

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">24h Volume</TableHead>
              <TableHead className="text-right">24h Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCoins.map((coin) => {
              const isPositive = coin.price_change_percentage_24h > 0;
              return (
                <TableRow key={coin.id}>
                  <TableCell className="font-medium">{coin.market_cap_rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="h-8 w-8" />
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-sm text-muted-foreground uppercase">
                          {coin.symbol}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(coin.current_price)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      isPositive ? "text-success" : "text-destructive"
                    )}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(coin.market_cap)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(coin.total_volume)}
                  </TableCell>
                  <TableCell>
                    <div className="h-12 w-24">
                      {coin.sparkline_in_7d && (
                        <MiniChart
                          data={coin.sparkline_in_7d.price}
                          isPositive={isPositive}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="icon"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-2">...</span>
          )}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const MiniChart = ({ data, isPositive }: { data: number[]; isPositive: boolean }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data
    .map((price, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        strokeWidth="2"
      />
    </svg>
  );
};
