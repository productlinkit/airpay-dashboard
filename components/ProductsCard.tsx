import { Wallet, Smartphone, ChevronRight } from "lucide-react";
import Link from "next/link";
import { products, type ProductStatus } from "@/lib/data";
import { Card } from "@/components/ui/card";

const iconMap = {
  wallet: Wallet,
  smartphone: Smartphone,
};

const statusStyles: Record<ProductStatus, string> = {
  Live: "bg-success-soft text-success",
  "In review": "bg-warning-soft text-warning",
  "Not activated": "bg-primary-soft text-muted-foreground",
};

export function ProductsCard() {
  return (
    <Card className="gap-0 rounded-2xl p-5 shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Products</h3>
        <Link
          href="/onboarding"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
        >
          Manage
          <ChevronRight size={14} />
        </Link>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Activated channels</p>

      <div className="mt-3 space-y-2.5">
        {products.map((product) => {
          const Icon = iconMap[product.icon];
          return (
            <div key={product.name} className="rounded-xl border border-border bg-background/50 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.desc}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[product.status]}`}
                >
                  {product.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
