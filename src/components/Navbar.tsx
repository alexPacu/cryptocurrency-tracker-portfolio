import { useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { Input } from "./ui/input";
import { Search, Bell, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NavbarProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  user?: any;
  onLogout?: () => void;
}

export const Navbar = ({ onSearch, showSearch = true, user, onLogout }: NavbarProps) => {
  const location = useLocation();

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/news", label: "News" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <span
                  key={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showSearch && user && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[300px] pl-9"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}

          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="ghost">Log In</Button>
          )}
        </div>
      </div>
    </nav>
  );
};
