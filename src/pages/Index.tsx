import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, BarChart3 } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Real-Time Tracking",
      description: "Monitor live cryptocurrency prices and market data from CoinGecko API",
    },
    {
      icon: Shield,
      title: "Secure Portfolio",
      description: "Manage your crypto assets with bank-level security and encryption",
    },
    {
      icon: Zap,
      title: "Instant Calculations",
      description: "Automatic profit/loss and ROI calculations in real-time",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track your portfolio performance with detailed charts and metrics",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <nav className="relative border-b border-border">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Logo />
            <Link to="/auth">
              <Button variant="ghost">Log In</Button>
            </Link>
          </div>
        </nav>

        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Track Your Crypto Portfolio
            <br />
            <span className="text-primary">In Real-Time</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Monitor live cryptocurrency prices, manage your digital assets, and calculate
            portfolio performance with our intuitive dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Free
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: "Active Users", value: "10K+" },
              { label: "Cryptocurrencies", value: "1000+" },
              { label: "Portfolio Value", value: "$50M+" },
              { label: "Market Updates", value: "Real-time" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need to Track Crypto
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="p-6 hover:border-primary transition-colors">
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Tracking?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of crypto investors managing their portfolios with CryptoTracker
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo />
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Contact Us</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2023 CryptoTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
