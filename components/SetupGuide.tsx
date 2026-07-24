"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Lock,
  CircleSlash,
  ChevronUp,
  ChevronDown,
  Minus,
  X,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { EmailVerifyModal } from "@/components/onboarding/EmailVerifyModal";

type StepState = "done" | "active" | "locked" | "future";

type Step = {
  key: string;
  label: string;
  hint: string;
  state: StepState;
  onClick?: () => void;
};

function stepIcon(state: StepState): { Icon: LucideIcon; className: string } {
  switch (state) {
    case "done":
      return { Icon: CheckCircle2, className: "text-success" };
    case "active":
      return { Icon: Circle, className: "text-primary" };
    case "locked":
      return { Icon: Lock, className: "text-muted-foreground" };
    case "future":
      return { Icon: CircleSlash, className: "text-muted-foreground/60" };
  }
}

export function SetupGuide() {
  const ob = useOnboarding();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // First-time behaviour: the email verification prompt opens automatically once.
  useEffect(() => {
    if (ob.ready && !ob.emailVerified && !ob.emailPromptSeen) {
      setModalOpen(true);
      ob.markEmailPromptSeen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ob.ready, ob.emailVerified, ob.emailPromptSeen]);

  if (!ob.ready) return null;

  const emailDone = ob.emailVerified;
  const businessDone = ob.status === "verified";
  // Setup for this slice is complete once email + business are verified.
  const allDone = emailDone && businessDone;

  const steps: Step[] = [
    {
      key: "email",
      label: "Verify your email",
      hint: emailDone ? `${ob.email || "Your email"} confirmed` : "Click the link we emailed you",
      state: emailDone ? "done" : "active",
      onClick: emailDone ? undefined : () => setModalOpen(true),
    },
    {
      key: "business",
      label: "Verify your business",
      hint: !emailDone
        ? "Verify your email first"
        : businessDone
          ? "Business verified"
          : ob.status === "in_review"
            ? "In review (1–2 business days)"
            : "Submit your KYB details",
      state: !emailDone ? "locked" : businessDone ? "done" : "active",
      onClick: emailDone && !businessDone ? () => router.push("/onboarding") : undefined,
    },
    {
      key: "activate",
      label: "Activate a product",
      hint: businessDone ? "Turn on DCB or Digital Payment" : "Available after verification",
      state: businessDone ? "active" : "future",
      onClick: businessDone ? () => toast.info("Product activation is coming soon (5.3).") : undefined,
    },
  ];

  const coreDone = (emailDone ? 1 : 0) + (businessDone ? 1 : 0);
  const progress = (coreDone / 2) * 100;

  if (allDone) return null;

  // Collapsed-to-launcher state.
  if (dismissed) {
    return (
      <>
        <button
          onClick={() => setDismissed(false)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
        >
          <ListChecks size={17} />
          Setup guide
          <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-xs">{coreDone}/2</span>
        </button>
        <EmailVerifyModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 w-[92vw] max-w-[340px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between px-4 pt-3.5">
          <p className="text-sm font-bold text-foreground">Setup guide</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toast.info("Customize your setup guide (demo).")}
              className="rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
            >
              Customize
            </button>
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand" : "Collapse"}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              {collapsed ? <ChevronUp size={16} /> : <Minus size={16} />}
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Close"
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* progress line */}
        <div className="mx-4 mt-2.5 h-1 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        {!collapsed && (
          <div className="mt-3 px-2 pb-2.5">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold text-foreground">Verify your account</p>
              <ChevronUp size={16} className="text-muted-foreground" />
            </div>

            <ul>
              {steps.map((s) => {
                const { Icon, className } = stepIcon(s.state);
                const clickable = !!s.onClick;
                return (
                  <li key={s.key}>
                    <button
                      onClick={s.onClick}
                      disabled={!clickable}
                      title={s.hint}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors",
                        clickable ? "hover:bg-background" : "cursor-default",
                      )}
                    >
                      <Icon size={18} className={cn("shrink-0", className)} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-sm font-medium",
                            s.state === "done"
                              ? "text-foreground"
                              : s.state === "future"
                                ? "text-muted-foreground"
                                : "text-foreground",
                          )}
                        >
                          {s.label}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{s.hint}</span>
                      </span>
                      {clickable && <ChevronDown size={15} className="-rotate-90 text-muted-foreground" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <EmailVerifyModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
