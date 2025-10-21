import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  className?: string;
}

export const StatCard = ({ title, value, change, isPositive, className }: StatCardProps) => {
  return (
    <Card className={cn("p-6", className)}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {change && (
        <p
          className={cn(
            "mt-2 text-sm font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}
        >
          {isPositive ? "+" : ""}{change}
        </p>
      )}
    </Card>
  );
};
