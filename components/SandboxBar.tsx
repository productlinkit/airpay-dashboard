"use client";

import { Info } from "lucide-react";
import { toast } from "sonner";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export function SandboxBar() {
  const ob = useOnboarding();

  function switchToLive() {
    if (ob.status !== "verified") {
      toast.info("Finish account setup (verify email & business) to switch to a live account.");
    } else {
      toast.success("Switched to live account (demo).");
    }
  }

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
