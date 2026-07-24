"use client";

import { useState } from "react";
import { ChevronDown, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { navItems } from "@/lib/data";
import { Logo } from "./Logo";

export function Sidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <aside className="hidden lg:flex w-[248px] shrink-0 flex-col gap-6 border-r border-border bg-card px-4 py-6">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="scroll-slim flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = active === item.label;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-soft text-primary"
                  : "text-body hover:bg-background"
              }`}
            >
              <Icon
                size={19}
                className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-body"}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {item.badge}
                </span>
              )}
              {item.hasChildren && (
                <ChevronDown size={15} className="text-muted-foreground" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Environment (sandbox vs production — FR-DEV-1) */}
      <div className="relative overflow-hidden rounded-2xl bg-ink p-4 text-white">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-6 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">
              <FlaskConical size={16} />
            </div>
            <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-semibold text-warning">
              Test mode
            </span>
          </div>
          <p className="mt-3 text-[13px] font-medium leading-snug text-white/80">
            You&apos;re viewing sandbox data. Switch to production to see live payments.
          </p>
          <button
            onClick={() => toast.success("Switched to live data (demo)")}
            className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            View live data
          </button>
        </div>
      </div>
    </aside>
  );
}
