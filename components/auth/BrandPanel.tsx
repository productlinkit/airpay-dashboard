import { ShieldCheck, Zap, Globe } from "lucide-react";
import { Logo } from "@/components/Logo";

const highlights = [
  { icon: Zap, text: "Go live in hours — self-serve onboarding, sandbox from day one." },
  { icon: ShieldCheck, text: "Full transaction cycle: payments, refunds, disputes, settlement." },
  { icon: Globe, text: "DCB and digital payments (e-wallet, VA, card, QRIS) in one platform." },
];

export function BrandPanel() {
  return (
    <div className="relative hidden w-[46%] max-w-[560px] shrink-0 flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex">
      {/* glow */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative">
        <Logo variant="light" />
      </div>

      <div className="relative">
        <h2 className="text-[28px] font-bold leading-tight tracking-tight">
          Accept DCB &amp; digital payments, the modern way.
        </h2>
        <p className="mt-3 max-w-sm text-sm text-white/60">
          The merchant &amp; partner platform for Direct Carrier Billing and
          digital payments — built for developing markets.
        </p>

        <ul className="mt-8 space-y-4">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-primary-light">
                <Icon size={18} />
              </span>
              <span className="pt-1.5 text-sm text-white/80">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/40">
        © 2025 AirPay — Merchant &amp; Partner Platform
      </p>
    </div>
  );
}
