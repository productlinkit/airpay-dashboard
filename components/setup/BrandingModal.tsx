"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Info, Download, Smartphone, Monitor, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  brandingTabs,
  defaultBranding,
  INVOICE_TASKS,
  type BrandingTab,
  type BrandingData,
} from "@/lib/setup";

export function BrandingModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ob = useOnboarding();
  const iconInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<BrandingData>(ob.branding ?? defaultBranding);
  const [tab, setTab] = useState<BrandingTab>("Invoice");
  const [docView, setDocView] = useState<"payment" | "pdf">("payment");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    if (open) {
      setForm(ob.branding ?? defaultBranding);
      setTab("Invoice");
      setDocView("payment");
      setDevice("desktop");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof BrandingData>(key: K, value: BrandingData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function pickImage(key: "icon" | "logo", file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set(key, reader.result as string);
    reader.readAsDataURL(file);
  }

  function save() {
    ob.saveBranding(form);
    ob.setTask(INVOICE_TASKS.branding, true);
    onOpenChange(false);
    toast.success("Branding saved.");
  }

  const name = ob.kyb.legalName?.trim() || "Your business";
  const mark = form.preferLogo && form.logo ? form.logo : form.icon;
  const cardWidth = device === "mobile" ? 300 : 372;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-4xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">Branding settings</DialogTitle>
          <DialogDescription className="sr-only">
            Set your default brand elements and preview how they appear to customers.
          </DialogDescription>
        </div>

        <div className="grid max-h-[72vh] grid-cols-1 overflow-y-auto md:grid-cols-[264px_1fr]">
          {/* ---------------- brand elements ---------------- */}
          <aside className="border-b border-border p-6 md:border-b-0 md:border-r">
            <h3 className="text-sm font-bold text-foreground">Brand elements</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Set your default brand elements to determine how AirPay products appear to your
              customers.
            </p>

            <div className="mt-6 space-y-5">
              {/* icon */}
              <UploadRow
                label="Icon"
                value={form.icon}
                onPick={() => iconInput.current?.click()}
                onRemove={() => set("icon", undefined)}
              />
              <input
                ref={iconInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage("icon", e.target.files?.[0])}
              />

              {/* logo */}
              <UploadRow
                label="Logo"
                value={form.logo}
                onPick={() => logoInput.current?.click()}
                onRemove={() => set("logo", undefined)}
              />
              <input
                ref={logoInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage("logo", e.target.files?.[0])}
              />

              {/* prefer logo */}
              <label className="flex cursor-pointer items-center justify-between border-t border-border pt-4">
                <span className="flex items-center gap-1 text-sm text-foreground">
                  Prefer logo over icon <Info size={12} className="text-muted-foreground" />
                </span>
                <input
                  type="checkbox"
                  checked={form.preferLogo}
                  onChange={(e) => set("preferLogo", e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>

              {/* colors */}
              <ColorRow
                label="Brand color"
                value={form.brandColor}
                onChange={(v) => set("brandColor", v)}
              />
              <ColorRow
                label="Accent color"
                value={form.accentColor}
                onChange={(v) => set("accentColor", v)}
              />
            </div>
          </aside>

          {/* ---------------- preview ---------------- */}
          <div className="p-6">
            {/* tabs */}
            <div className="scroll-slim -mx-1 flex gap-5 overflow-x-auto border-b border-border px-1">
              {brandingTabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "shrink-0 border-b-2 pb-2.5 text-sm font-medium transition-colors",
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* toolbar */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground">PREVIEW</span>
              <div className="flex items-center gap-2">
                {tab === "Invoice" && (
                  <div className="flex rounded-lg border border-border p-0.5 text-xs font-medium">
                    {(
                      [
                        ["payment", "Payment page"],
                        ["pdf", "PDF"],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setDocView(key)}
                        className={cn(
                          "rounded-md px-2.5 py-1 transition-colors",
                          docView === key ? "bg-primary-soft text-primary" : "text-body hover:text-foreground",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex rounded-lg border border-border p-0.5">
                  <button
                    onClick={() => setDevice("mobile")}
                    aria-label="Mobile preview"
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-md",
                      device === "mobile" ? "bg-primary-soft text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Smartphone size={15} />
                  </button>
                  <button
                    onClick={() => setDevice("desktop")}
                    aria-label="Desktop preview"
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-md",
                      device === "desktop" ? "bg-primary-soft text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Monitor size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* preview surface */}
            <div className="mt-4 grid min-h-[420px] place-items-start justify-center rounded-xl bg-background p-6">
              <BrandPreview
                tab={tab}
                docView={docView}
                width={cardWidth}
                name={name}
                mark={mark}
                brandColor={form.brandColor}
                accentColor={form.accentColor}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-xl" onClick={save}>
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- rows --------------------------------- */

function UploadRow({
  label,
  value,
  onPick,
  onRemove,
}: {
  label: string;
  value?: string;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-sm text-foreground">
        {label} <Info size={12} className="text-muted-foreground" />
      </span>
      {value ? (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-10 w-10 rounded-lg border border-border object-cover" />
          <button
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={onPick}
          className="grid h-10 w-10 place-items-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Plus size={18} />
        </button>
      )}
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-sm text-foreground">
        {label} <Info size={12} className="text-muted-foreground" />
      </span>
      <div className="flex items-center overflow-hidden rounded-lg border border-border">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} swatch`}
          className="h-8 w-9 cursor-pointer border-0 bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-[86px] border-l border-border bg-card px-2 text-sm text-foreground outline-none"
        />
      </div>
    </div>
  );
}

/* ------------------------------- previews ------------------------------- */

type PreviewProps = {
  tab: BrandingTab;
  docView: "payment" | "pdf";
  width: number;
  name: string;
  mark?: string;
  brandColor: string;
  accentColor: string;
};

function BrandHeader({ name, mark, brandColor }: { name: string; mark?: string; brandColor: string }) {
  return (
    <div className="flex items-center gap-2">
      {mark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mark} alt="" className="h-6 max-w-[130px] rounded object-contain" />
      ) : (
        <span className="text-sm font-semibold text-white">{name}</span>
      )}
    </div>
  );
}

function CardField({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border px-2.5 py-2 text-xs text-muted-foreground">{label}</div>
  );
}

function PayWithCard({ accentColor }: { accentColor: string }) {
  return (
    <>
      <p className="mt-4 text-sm font-semibold text-foreground">Pay with card</p>
      <p className="mt-2 text-[11px] text-muted-foreground">Card information</p>
      <div className="mt-1 space-y-1.5">
        <CardField label="1234 1234 1234 1234" />
        <div className="grid grid-cols-2 gap-1.5">
          <CardField label="MM / YY" />
          <CardField label="CVC" />
        </div>
      </div>
      <button
        className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
        style={{ backgroundColor: accentColor }}
      >
        Pay
      </button>
    </>
  );
}

function BrandPreview({ tab, docView, width, name, mark, brandColor, accentColor }: PreviewProps) {
  const shell = "overflow-hidden rounded-xl border border-border bg-card shadow-sm";

  // Invoice — PDF document view
  if (tab === "Invoice" && docView === "pdf") {
    return (
      <div className={shell} style={{ width }}>
        <div className="p-5">
          <div className="flex items-center justify-between">
            {mark ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mark} alt="" className="h-7 max-w-[130px] object-contain" />
            ) : (
              <span className="text-base font-bold" style={{ color: brandColor }}>
                {name}
              </span>
            )}
            <span className="text-sm font-semibold text-foreground">Invoice</span>
          </div>
          <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">Invoice number</span>
            <span className="text-foreground">#TEST-01234</span>
            <span className="text-muted-foreground">Date due</span>
            <span className="text-foreground">Aug 3, 2026</span>
            <span className="text-muted-foreground">Bill to</span>
            <span className="text-foreground">Example Name</span>
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Description</span>
              <span className="text-muted-foreground">Amount</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-foreground">Premium plan</span>
              <span className="text-foreground">$5,000.00</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-foreground">Total due</span>
            <span className="text-sm font-bold" style={{ color: brandColor }}>
              $5,000.00
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Invoice — hosted payment page (default, matches reference)
  if (tab === "Invoice") {
    return (
      <div className={shell} style={{ width }}>
        <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
          <BrandHeader name={name} mark={mark} brandColor={brandColor} />
          <div className="mt-4 flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold">$5,000.00</p>
              <p className="text-sm text-white/70">Due Aug 3, 2026</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-medium">
              <Download size={11} /> Invoice PDF
            </span>
          </div>
          <p className="mt-3 inline-flex items-center gap-1 text-sm text-white/80">
            View invoice and payment details <ChevronRight size={14} />
          </p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">To</span>
            <span className="text-foreground">Example Name</span>
            <span className="text-muted-foreground">From</span>
            <span className="text-foreground">{name}</span>
            <span className="text-muted-foreground">Invoice</span>
            <span className="text-foreground">#TEST-01234</span>
          </div>
          <PayWithCard accentColor={accentColor} />
        </div>
      </div>
    );
  }

  // Checkout & Payment Links
  if (tab === "Checkout & Payment Links") {
    return (
      <div className={shell} style={{ width }}>
        <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
          <BrandHeader name={name} mark={mark} brandColor={brandColor} />
          <p className="mt-3 text-sm text-white/80">Premium plan</p>
          <p className="text-2xl font-bold">$5,000.00</p>
        </div>
        <div className="p-5">
          <PayWithCard accentColor={accentColor} />
        </div>
      </div>
    );
  }

  // Email receipts
  if (tab === "Email receipts") {
    return (
      <div className={shell} style={{ width }}>
        <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
          <BrandHeader name={name} mark={mark} brandColor={brandColor} />
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground">Receipt from {name}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">$5,000.00</p>
          <p className="text-xs text-muted-foreground">Paid on Aug 3, 2026 · Receipt #1234</p>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-foreground">Premium plan</span>
            <span className="text-foreground">$5,000.00</span>
          </div>
          <button
            className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Download receipt
          </button>
        </div>
      </div>
    );
  }

  // Customer portal
  if (tab === "Customer portal") {
    return (
      <div className={shell} style={{ width }}>
        <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
          <BrandHeader name={name} mark={mark} brandColor={brandColor} />
          <p className="mt-3 text-sm text-white/80">Manage your subscription</p>
        </div>
        <div className="p-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current plan</span>
            <span className="font-medium text-foreground">Premium · $5,000/mo</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Payment method</span>
            <span className="font-medium text-foreground">•••• 4242</span>
          </div>
          <button
            className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Update payment method
          </button>
        </div>
      </div>
    );
  }

  // Global payouts
  if (tab === "Global payouts") {
    return (
      <div className={shell} style={{ width }}>
        <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
          <BrandHeader name={name} mark={mark} brandColor={brandColor} />
          <p className="mt-3 text-sm text-white/80">Global payouts</p>
        </div>
        <div className="p-5 text-sm">
          <p className="text-muted-foreground">Next payout</p>
          <p className="mt-0.5 text-2xl font-bold text-foreground">$4,820.00</p>
          <p className="text-xs text-muted-foreground">Arrives Aug 5, 2026 · to •••• 4021</p>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted-foreground">Payout currency</span>
            <span className="font-medium text-foreground">🇮🇩 IDR</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Schedule</span>
            <span className="font-medium text-foreground">Daily · automatic</span>
          </div>
          <button
            className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Add payout method
          </button>
        </div>
      </div>
    );
  }

  // Identity
  return (
    <div className={shell} style={{ width }}>
      <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
        <BrandHeader name={name} mark={mark} brandColor={brandColor} />
      </div>
      <div className="p-5">
        <p className="text-base font-semibold text-foreground">Verify your identity</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {name} uses AirPay to verify your identity securely.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-body">
          <li>1. Take a photo of your ID</li>
          <li>2. Take a selfie</li>
        </ul>
        <button
          className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: accentColor }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
