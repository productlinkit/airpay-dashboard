import { Wifi } from "lucide-react";

export function BalanceCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/25 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="3.4" fill="#fff" />
            <circle cx="17" cy="7" r="3.4" fill="#fff" opacity="0.6" />
            <circle cx="7" cy="17" r="3.4" fill="#fff" opacity="0.6" />
            <circle cx="17" cy="17" r="3.4" fill="#fff" />
          </svg>
          <Wifi size={22} className="rotate-90 text-white/70" />
        </div>

        <p className="mt-8 text-sm font-medium text-white/70">PT Contoh Sejahtera</p>

        <div className="mt-3">
          <p className="text-xs text-white/50">Available balance</p>
          <p className="mt-1 text-[26px] font-bold leading-none tracking-tight">$184,320</p>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-white/45">In transit</p>
            <p className="text-sm font-semibold">$58,900</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-white/45">Next payout</p>
            <p className="text-sm font-semibold">Jul 15</p>
          </div>
        </div>
      </div>
    </div>
  );
}
