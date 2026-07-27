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
import { ManagePaymentModal } from "@/components/setup/ManagePaymentModal";
import { AcceptPaymentsModal } from "@/components/setup/AcceptPaymentsModal";
import { BrandingModal } from "@/components/setup/BrandingModal";
import { CreateCustomerModal } from "@/components/setup/CreateCustomerModal";
import { RemindersModal } from "@/components/setup/RemindersModal";
import { MANAGE_TASKS, PAYMENTS_TASKS, INVOICE_TASKS } from "@/lib/setup";

type ItemState = "done" | "todo" | "locked" | "future";

type Item = {
  key: string;
  label: string;
  hint?: string;
  state: ItemState;
  onClick?: () => void;
};

type Section = { key: string; title: string; items: Item[] };

function itemIcon(state: ItemState): { Icon: LucideIcon; className: string } {
  switch (state) {
    case "done":
      return { Icon: CheckCircle2, className: "text-success" };
    case "locked":
      return { Icon: Lock, className: "text-muted-foreground" };
    case "future":
      return { Icon: CircleSlash, className: "text-muted-foreground/60" };
    case "todo":
      return { Icon: Circle, className: "text-muted-foreground" };
  }
}

export function SetupGuide() {
  const ob = useOnboarding();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // Which section is expanded (accordion, single-open).
  const [openSection, setOpenSection] = useState<string>("manage");
  // "Set up Manage Payment" modal flow.
  const [manageOpen, setManageOpen] = useState(false);
  const [manageStep, setManageStep] = useState<"intro" | "sell">("intro");
  // "Set up Payments" — accept-payments modal.
  const [acceptOpen, setAcceptOpen] = useState(false);
  // "Set up invoices" — branding + create-customer modals.
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);

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

  // A task backed by the "Set up Manage Payment" modal — opens it at the given step.
  function openManage(step: "intro" | "sell") {
    setManageStep(step);
    setManageOpen(true);
  }
  const manageItem = (key: string, label: string, step: "intro" | "sell"): Item => ({
    key,
    label,
    state: ob.tasks[key] ? "done" : "todo",
    onClick: () => openManage(step),
  });

  const sections: Section[] = [
    {
      key: "manage",
      title: "Set up Manage Payment",
      items: [
        manageItem(MANAGE_TASKS.start, "Get started with Manage Payments", "intro"),
        manageItem(MANAGE_TASKS.selling, "Tell us what you're selling", "sell"),
      ],
    },
    {
      key: "payments",
      title: "Set up Payments",
      items: [
        {
          key: PAYMENTS_TASKS.accept,
          label: "Choose how to accept payments",
          state: ob.tasks[PAYMENTS_TASKS.accept] ? "done" : "todo",
          onClick: () => setAcceptOpen(true),
        },
        {
          key: PAYMENTS_TASKS.product,
          label: "Create a non-recurring product",
          state: ob.tasks[PAYMENTS_TASKS.product] ? "done" : "todo",
          onClick: () => router.push("/setup/add-product"),
        },
        {
          // Enabled only when the merchant picked "Prebuilt checkout form"; disabled by default.
          key: PAYMENTS_TASKS.checkout,
          label: "Build your checkout",
          hint:
            ob.acceptMethod === "checkout"
              ? "Design your prebuilt checkout"
              : "Choose “Prebuilt checkout form” first",
          state:
            ob.acceptMethod !== "checkout"
              ? "locked"
              : ob.tasks[PAYMENTS_TASKS.checkout]
                ? "done"
                : "todo",
          onClick:
            ob.acceptMethod === "checkout"
              ? () => {
                  ob.setTask(PAYMENTS_TASKS.checkout, true);
                  toast.info("Opening checkout builder (demo).");
                }
              : undefined,
        },
      ],
    },
    {
      key: "invoices",
      title: "Set up invoices",
      items: [
        {
          key: INVOICE_TASKS.branding,
          label: "Add your branding",
          state: ob.tasks[INVOICE_TASKS.branding] ? "done" : "todo",
          onClick: () => setBrandingOpen(true),
        },
        {
          key: INVOICE_TASKS.customer,
          label: "Create a customer",
          state: ob.tasks[INVOICE_TASKS.customer] ? "done" : "todo",
          onClick: () => setCustomerOpen(true),
        },
        {
          key: INVOICE_TASKS.invoice,
          label: "Create an invoice",
          state: ob.tasks[INVOICE_TASKS.invoice] ? "done" : "todo",
          onClick: () => router.push("/setup/create-invoice"),
        },
        {
          key: INVOICE_TASKS.reminders,
          label: "Set up reminders",
          state: ob.tasks[INVOICE_TASKS.reminders] ? "done" : "todo",
          onClick: () => setRemindersOpen(true),
        },
      ],
    },
    {
      key: "verify",
      title: "Verify your account",
      items: [
        {
          key: "email",
          label: "Verify your email",
          hint: emailDone ? `${ob.email || "Your email"} confirmed` : "Click the link we emailed you",
          state: emailDone ? "done" : "todo",
          // Still clickable when done — reopens the modal (shows the verified state).
          onClick: () => setModalOpen(true),
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
          state: !emailDone ? "locked" : businessDone ? "done" : "todo",
          // Clickable whenever email is verified — done just opens the status view.
          onClick: emailDone ? () => router.push("/onboarding") : undefined,
        },
        {
          key: "go-live",
          label: "Go live",
          hint:
            emailDone && businessDone
              ? "Switch to your live account"
              : "Verify your email and business first",
          state: ob.live ? "done" : emailDone && businessDone ? "todo" : "locked",
          onClick:
            emailDone && businessDone && !ob.live
              ? () => {
                  ob.setLive(true);
                  toast.success("You're now on your live account.");
                }
              : undefined,
        },
      ],
    },
  ];

  const allItems = sections.flatMap((s) => s.items);
  const totalCount = allItems.length;
  const doneCount = allItems.filter((i) => i.state === "done").length;
  const progress = (doneCount / totalCount) * 100;

  // Everything checked off → nothing left to guide.
  if (doneCount === totalCount) return null;

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
          <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-xs">
            {doneCount}/{totalCount}
          </span>
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
          <div className="scroll-slim mt-2 max-h-[60vh] overflow-y-auto px-2 pb-2">
            {sections.map((sec) => {
              const isOpen = openSection === sec.key;
              const secDone = sec.items.filter((i) => i.state === "done").length;
              return (
                <div key={sec.key} className="border-b border-border last:border-0">
                  <button
                    onClick={() => setOpenSection(isOpen ? "" : sec.key)}
                    className="flex w-full items-center justify-between gap-2 px-2 py-2.5 text-left"
                  >
                    <span className="text-sm font-semibold text-foreground">{sec.title}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {secDone}/{sec.items.length}
                      </span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "text-muted-foreground transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="pb-1">
                      {sec.items.map((item) => {
                        const { Icon, className } = itemIcon(item.state);
                        const clickable = !!item.onClick;
                        return (
                          <li key={item.key}>
                            <button
                              onClick={item.onClick}
                              disabled={!clickable}
                              title={item.hint}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                                clickable ? "hover:bg-background" : "cursor-default",
                              )}
                            >
                              <Icon size={18} className={cn("shrink-0", className)} />
                              <span
                                className={cn(
                                  "flex-1 text-sm",
                                  item.state === "future" || item.state === "locked"
                                    ? "text-muted-foreground"
                                    : "text-foreground",
                                )}
                              >
                                {item.label}
                              </span>
                              {clickable && (
                                <ChevronDown size={15} className="-rotate-90 text-muted-foreground" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EmailVerifyModal open={modalOpen} onOpenChange={setModalOpen} />
      <ManagePaymentModal
        open={manageOpen}
        onOpenChange={setManageOpen}
        startStep={manageStep}
      />
      <AcceptPaymentsModal open={acceptOpen} onOpenChange={setAcceptOpen} />
      <BrandingModal open={brandingOpen} onOpenChange={setBrandingOpen} />
      <CreateCustomerModal open={customerOpen} onOpenChange={setCustomerOpen} />
      <RemindersModal open={remindersOpen} onOpenChange={setRemindersOpen} />
    </>
  );
}
