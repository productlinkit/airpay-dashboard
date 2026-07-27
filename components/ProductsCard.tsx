"use client";

import Link from "next/link";
import { Wallet, Signal, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { Card } from "@/components/ui/card";
import {
  productKeys,
  productMeta,
  actStatusMeta,
  type ProductKey,
  type ActTone,
} from "@/lib/activation";

const toneStyles: Record<ActTone, string> = {
  neutral: "bg-primary-soft text-muted-foreground",
  info: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

const productIcon: Record<ProductKey, LucideIcon> = { dcb: Signal, digital: Wallet };

export function ProductsCard() {
  const ob = useOnboarding();

  return (
    <Card className="gap-0 rounded-2xl p-5 shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Products</h3>
        <Link
          href="/products"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
        >
          Manage
          <ChevronRight size={14} />
        </Link>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">Activation status</p>

      <div className="mt-3 space-y-2.5">
        {productKeys.map((key) => {
          const meta = productMeta[key];
          const status = ob.ready ? ob.activations[key].status : "not_activated";
          const sm = actStatusMeta[status];
          const Icon = productIcon[key];
          return (
            <Link
              href="/products"
              key={key}
              className="block rounded-xl border border-border bg-background/50 p-3.5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{meta.short}</p>
                    <p className="text-xs text-muted-foreground">
                      {key === "digital" ? "e-wallet · VA · card · QRIS" : "Charge to mobile bill"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    toneStyles[sm.tone],
                  )}
                >
                  {sm.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
