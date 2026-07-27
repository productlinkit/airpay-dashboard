"use client";

import { Info } from "lucide-react";
import { toast } from "sonner";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export function SandboxBar() {
  const ob = useOnboarding();
  const canGoLive = ob.emailVerified && ob.status === "verified";

  function switchToLive() {
    if (!canGoLive) {
      toast.info("Verify your email and business first to switch to a live account.");
      return;
    }
    ob.setLive(true);
    toast.success("You're now on your live account.");
  }

  // ---- Live mode ----
  if (ob.live) {
    return (
      <div className="sticky top-0 z-50 flex items-center gap-3 bg-success px-4 py-2.5 text-white lg:px-6">
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-white" />
          Live
        </span>

        <p className="hidden flex-1 text-center text-sm text-white/90 md:block">
          You&apos;re on your live account — changes here affect real customers and payments.
        </p>

        <button
          onClick={() => {
            ob.setLive(false);
            toast.info("Switched back to sandbox.");
          }}
          className="ml-auto shrink-0 rounded-lg bg-white/20 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/30 md:ml-0"
        >
          Switch to sandbox
        </button>
      </div>
    );
  }

  // ---- Sandbox mode ----
  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 bg-ink px-4 py-2.5 text-white lg:px-6">
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold">
        Sandbox
        <Info size={14} className="text-white/60" />
      </span>

      <p className="hidden flex-1 text-center text-sm text-white/80 md:block">
        You&apos;re testing in a sandbox. Changes you make here don&apos;t affect real customers or
        payments.
      </p>

      <button
        onClick={switchToLive}
        className="ml-auto shrink-0 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark md:ml-0"
      >
        Switch to live account
      </button>
    </div>
  );
}
