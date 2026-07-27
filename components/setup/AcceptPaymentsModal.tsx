"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { acceptPaymentOptions, PAYMENTS_TASKS } from "@/lib/setup";

export function AcceptPaymentsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ob = useOnboarding();
  const [selected, setSelected] = useState(ob.acceptMethod);

  useEffect(() => {
    if (open) setSelected(ob.acceptMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function save() {
    if (!selected) return;
    ob.setAcceptMethod(selected);
    ob.setTask(PAYMENTS_TASKS.accept, true);
    onOpenChange(false);
    const chosen = acceptPaymentOptions.find((o) => o.key === selected);
    toast.success(`${chosen?.title ?? "Payment method"} selected.`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">How do you want to accept payments?</DialogTitle>
          <DialogDescription>
            Choose the payments integration that works best for your business.{" "}
            <button
              onClick={() => toast.info("Comparing payment integrations (demo).")}
              className="font-semibold text-primary hover:underline"
            >
              Compare payment integrations
            </button>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          {acceptPaymentOptions.map((o) => {
            const active = selected === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setSelected(o.key)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                  active
                    ? "border-primary bg-primary-50 ring-2 ring-primary/15"
                    : "border-border hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                    active ? "border-primary" : "border-border",
                  )}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{o.title}</span>
                  <span className="block text-xs text-muted-foreground">{o.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter className="mt-2">
          <Button className="rounded-xl" disabled={!selected} onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
