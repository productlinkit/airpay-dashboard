"use client";

import { Link2, RotateCcw, ArrowUpRight, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const actions = [
  { label: "Payment link", icon: Link2, toastMsg: "New payment link created" },
  { label: "Refund", icon: RotateCcw, toastMsg: "Refund form opened" },
  { label: "Payout", icon: ArrowUpRight, toastMsg: "Manual payout requested" },
  { label: "API keys", icon: KeyRound, toastMsg: "Opening developer credentials…" },
];

export function QuickActions() {
  return (
    <Card className="grid grid-cols-4 gap-2 rounded-2xl p-2.5 shadow-none">
      {actions.map(({ label, icon: Icon, toastMsg }) => (
        <button
          key={label}
          onClick={() => toast.success(toastMsg)}
          className="group flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 transition-colors hover:bg-primary-soft"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <Icon size={17} />
          </span>
          <span className="text-[11px] font-medium text-body">{label}</span>
        </button>
      ))}
    </Card>
  );
}
