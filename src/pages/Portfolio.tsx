import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  image: string;
}

export default function Portfolio() {
  const [assets, setAssets] = useState<PortfolioAsset[]>([
    {
      id: "1",
      name: "Bitcoin",
      symbol: "BTC",
      quantity: 0.5,
      purchasePrice: 45000,
      image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    },
    {
      id: "2",
      name: "Ethereum",
      symbol: "ETH",
      quantity: 10,
      purchasePrice: 3000,
      image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    },
    {
      id: "3",
      name: "Cardano",
      symbol: "ADA",
      quantity: 1000,
      purchasePrice: 1.5,
      image: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    },
    {
      id: "4",
      name: "Solana",
      symbol: "SOL",
      quantity: 50,
      purchasePrice: 150,
      image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    symbol: "",
    quantity: "",
    purchasePrice: "",
  });

  const handleAddAsset = () => {
    const asset: PortfolioAsset = {
      id: Date.now().toString(),
      name: newAsset.name,
      symbol: newAsset.symbol.toUpperCase(),
      quantity: parseFloat(newAsset.quantity),
      purchasePrice: parseFloat(newAsset.purchasePrice),
      image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    };

    setAssets([...assets, asset]);
    setIsAddDialogOpen(false);
    setNewAsset({ name: "", symbol: "", quantity: "", purchasePrice: "" });
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter((asset) => asset.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={{}} onLogout={() => {}} showSearch={false} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Your Crypto Assets</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cryptocurrency Name</Label>
                  <Input
                    id="name"
                    placeholder="Bitcoin"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="BTC"
                    value={newAsset.symbol}
                    onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="any"
                    placeholder="0.5"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="any"
                    placeholder="45000.00"
                    value={newAsset.purchasePrice}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, purchasePrice: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleAddAsset} className="w-full">
                  Add to Portfolio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>CRYPTOCURRENCY</TableHead>
                <TableHead className="text-right">QUANTITY</TableHead>
                <TableHead className="text-right">PURCHASE PRICE</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={asset.image} alt={asset.name} className="h-10 w-10" />
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{asset.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${asset.purchasePrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <footer className="mt-12 border-t border-border pt-8 pb-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-6">
            <p>© 2023 CryptoTracker. All rights reserved.</p>
            <a href="#" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground">
              Contact Us
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
