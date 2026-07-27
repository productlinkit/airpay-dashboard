"use client";

import { useEffect, useState } from "react";
import { MailCheck, RefreshCw, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function EmailVerifyModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ob = useOnboarding();
  const email = ob.email || "your email";

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (open) setLoading(false);
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function confirm() {
    setLoading(true);
    // Simulated: pretend the user clicked the link in their inbox.
    setTimeout(() => {
      ob.verifyEmail();
      onOpenChange(false);
      toast.success("Email verified — you can now verify your business.");
    }, 700);
  }

  // Already verified — show a confirmation instead of the verification prompt.
  if (ob.emailVerified) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success">
              <BadgeCheck size={28} />
            </span>
            <DialogTitle className="text-xl">Email verified</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">{email}</span> is confirmed. You&apos;re
              all set — no further action needed.
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={() => onOpenChange(false)}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Done
          </button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <span className="mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <MailCheck size={26} />
          </span>
          <DialogTitle className="text-xl">Verify your email</DialogTitle>
          <DialogDescription>
            We sent a verification link to{" "}
            <span className="font-semibold text-foreground">{email}</span>. Open your inbox and
            click the link to confirm your account — it usually arrives in under a minute.
          </DialogDescription>
        </DialogHeader>

        <button
          onClick={confirm}
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Confirming…" : "I've clicked the link"}
        </button>

        <button
          onClick={() => {
            setCooldown(30);
            toast.info(`Verification link resent to ${email}.`);
          }}
          disabled={cooldown > 0}
          className="mx-auto flex items-center gap-1.5 text-sm font-medium text-body transition-colors hover:text-foreground disabled:opacity-60"
        >
          <RefreshCw size={14} />
          {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend verification link"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Demo — the button above simulates clicking the email link.
        </p>
      </DialogContent>
    </Dialog>
  );
}
