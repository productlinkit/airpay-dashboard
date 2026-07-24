"use client";

import { ArrowUpRight, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { disputeSummary, disputes, type DisputeStatus } from "@/lib/data";
import { Card } from "@/components/ui/card";

const statusStyles: Record<DisputeStatus, string> = {
  "Needs response": "bg-warning-soft text-warning",
  "Under review": "bg-primary-soft text-primary",
  Won: "bg-success-soft text-success",
  Lost: "bg-danger-soft text-danger",
};

export function DisputesCard({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col gap-0 rounded-2xl p-5 shadow-none", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Disputes</h3>
        <button
          onClick={() => toast.info("Opening all disputes…")}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Win rate</p>
          <p className="mt-0.5 text-lg font-bold text-foreground">{disputeSummary.winRate}</p>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-success">
            <ArrowUpRight size={11} />
            {disputeSummary.winRateDelta}
          </span>
        </div>
        <div className="rounded-xl bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Open</p>
          <p className="mt-0.5 text-lg font-bold text-foreground">{disputeSummary.open}</p>
        </div>
        <div className="rounded-xl bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">To respond</p>
          <p className="mt-0.5 text-lg font-bold text-warning">{disputeSummary.needsResponse}</p>
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-2">
        {disputes.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-border px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{d.id}</p>
              <p className="truncate text-xs text-muted-foreground">{d.reason}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-sm font-semibold text-foreground">{d.amount}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  statusStyles[d.status],
                )}
              >
                {d.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
