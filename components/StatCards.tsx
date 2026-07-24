import { Wallet, TrendingUp, Banknote, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { stats } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const icons = [Wallet, TrendingUp, Banknote];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat, i) => {
        const Icon = icons[i];
        const up = stat.trend === "up";
        return (
          <Card
            key={stat.label}
            className="flex min-h-[148px] flex-col justify-between gap-0 rounded-2xl p-5 shadow-none"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon size={18} />
              </span>
              <Badge
                className={cn(
                  "gap-0.5 rounded-md border-transparent px-1.5 py-0.5 text-[11px] font-semibold",
                  up ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                )}
              >
                {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.delta}
              </Badge>
            </div>

            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
