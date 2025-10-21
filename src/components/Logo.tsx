import { Bitcoin } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-primary p-1.5">
        <Bitcoin className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold">CryptoTracker</span>
    </div>
  );
};
