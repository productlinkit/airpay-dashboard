"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, Megaphone, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { CreateCustomerModal } from "@/components/setup/CreateCustomerModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  productCurrencies,
  invoiceTemplates,
  formatMoney,
  INVOICE_TASKS,
  type CustomerItem,
} from "@/lib/setup";

const INVOICE_NO = "EXAMPLE-0001";
const ISSUE_DATE = "Aug 25, 2026";
const DUE_DATE = "Aug 25, 2026";

type Line = { id: string; description: string; qty: number; unitPrice: number };

const paymentModes = [
  { key: "request", title: "Request payment", desc: "Create an invoice requesting payment on a specific date" },
  { key: "multiple", title: "Request in multiple payments", desc: "Set up a payment plan for your customers to pay over time" },
  { key: "autocharge", title: "Autocharge customer", desc: "Automatically charge a payment method on file" },
] as const;

export default function CreateInvoicePage() {
  const ob = useOnboarding();
  const router = useRouter();

  const [customerId, setCustomerId] = useState("");
  const [currency, setCurrency] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [paymentMode, setPaymentMode] = useState<string>("request");
  const [template, setTemplate] = useState("Default");
  const [memo, setMemo] = useState("");

  const [custOpen, setCustOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewTab, setPreviewTab] = useState<"pdf" | "email" | "payment">("pdf");

  if (!ob.ready) {
    return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  }

  const selected = ob.customers.find((c) => c.id === customerId);
  const cur = currency || "USD";
  const businessName = ob.kyb.legalName?.trim() || "Your business";
  const billTo = selected?.name || "Example Customer";
  const { brandColor, accentColor } = ob.branding;

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const total = subtotal;

  function changeCurrency(v: string) {
    if (currency && v !== currency && lines.length) {
      setLines([]);
      toast.info("Items cleared because the currency changed.");
    }
    setCurrency(v);
  }

  function addProductItem(p: (typeof ob.products)[number]) {
    if (!currency) setCurrency(p.currency);
    setLines((ls) => [
      ...ls,
      { id: `li_${Date.now().toString(36)}${ls.length}`, description: p.name, qty: 1, unitPrice: parseFloat(p.amount) || 0 },
    ]);
    setItemOpen(false);
  }
  function addBlankItem() {
    setLines((ls) => [...ls, { id: `li_${Date.now().toString(36)}${ls.length}`, description: "", qty: 1, unitPrice: 0 }]);
    setItemOpen(false);
  }
  function updateLine(id: string, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function removeLine(id: string) {
    setLines((ls) => ls.filter((l) => l.id !== id));
  }

  const canReview = !!customerId;

  function review() {
    if (!canReview) return;
    ob.setTask(INVOICE_TASKS.invoice, true);
    toast.success("Invoice created (demo).");
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-5 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <X size={18} />
          </Link>
          <span className="h-5 w-px bg-border" />
          <span className="text-sm font-semibold text-foreground">Create test invoice</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Thanks for the feedback (demo).")}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background sm:flex"
          >
            <Megaphone size={15} /> Feedback?
          </button>
          <Button variant="outline" className="rounded-lg" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
          <Button className="rounded-lg" disabled={!canReview} onClick={review}>
            Review invoice
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* ----------------- form ----------------- */}
        <div className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-xl space-y-10">
            {/* customer */}
            <section>
              <h2 className="text-lg font-bold text-foreground">Customer</h2>
              <div className="relative mt-3">
                <button
                  onClick={() => setCustOpen((o) => !o)}
                  className={cn(
                    "flex h-11 w-full items-center rounded-xl border bg-card px-3.5 text-left text-sm transition-colors",
                    custOpen ? "border-primary ring-2 ring-primary/15" : "border-border",
                    selected ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {selected ? `${selected.name} · ${selected.email}` : "Find or add a test customer…"}
                </button>
                {custOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCustOpen(false)} />
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
                      <button
                        onClick={() => {
                          setAddCustomerOpen(true);
                          setCustOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary-soft"
                      >
                        <Plus size={16} /> Add new customer
                      </button>
                      {ob.customers.length > 0 && (
                        <>
                          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
                            RECENT
                          </p>
                          {ob.customers.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setCustomerId(c.id);
                                setCustOpen(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-background"
                            >
                              <span className="font-medium text-foreground">{c.name}</span>
                              <span className="truncate text-muted-foreground">{c.email}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3">
                <Select value={currency || undefined} onValueChange={changeCurrency}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Choose a currency…" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCurrencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Selecting a new currency will clear all items from the invoice.
                </p>
              </div>
            </section>

            {/* items */}
            <section>
              <h2 className="text-lg font-bold text-foreground">Items</h2>
              <p className="mt-1 text-sm text-body">
                Add single, one-time items or products from your product catalog to this invoice.
              </p>

              {lines.length > 0 && (
                <div className="mt-4 space-y-2">
                  {lines.map((l) => (
                    <div key={l.id} className="grid grid-cols-[1fr_56px_110px_auto] items-center gap-2">
                      <Input
                        value={l.description}
                        placeholder="Description"
                        onChange={(e) => updateLine(l.id, { description: e.target.value })}
                        className="h-10 rounded-lg"
                      />
                      <Input
                        inputMode="numeric"
                        value={String(l.qty)}
                        onChange={(e) => updateLine(l.id, { qty: parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0 })}
                        className="h-10 rounded-lg text-center"
                      />
                      <Input
                        inputMode="decimal"
                        value={String(l.unitPrice)}
                        onChange={(e) => updateLine(l.id, { unitPrice: parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0 })}
                        className="h-10 rounded-lg"
                      />
                      <button
                        onClick={() => removeLine(l.id)}
                        aria-label="Remove item"
                        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-background hover:text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative mt-4">
                <button
                  onClick={() => setItemOpen((o) => !o)}
                  className={cn(
                    "flex h-11 w-full items-center rounded-xl border bg-card px-3.5 text-left text-sm text-muted-foreground transition-colors",
                    itemOpen ? "border-primary ring-2 ring-primary/15" : "border-border",
                  )}
                >
                  Find or add an item
                </button>
                {itemOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setItemOpen(false)} />
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
                      <button
                        onClick={addBlankItem}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary-soft"
                      >
                        <Plus size={16} /> Add a one-time item
                      </button>
                      {ob.products.length > 0 && (
                        <>
                          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
                            PRODUCT CATALOG
                          </p>
                          {ob.products.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => addProductItem(p)}
                              className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-background"
                            >
                              <span className="truncate font-medium text-foreground">{p.name}</span>
                              <span className="shrink-0 text-muted-foreground">
                                {formatMoney(p.amount, p.currency)}
                              </span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* payment collection */}
            <section>
              <h2 className="text-lg font-bold text-foreground">Payment collection</h2>
              <div className="mt-3 divide-y divide-border">
                {paymentModes.map((m) => {
                  const active = paymentMode === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setPaymentMode(m.key)}
                      className="flex w-full items-start gap-3 py-4 text-left"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2",
                          active ? "border-primary" : "border-muted-foreground/40",
                        )}
                      >
                        {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </span>
                      <span>
                        <span className={cn("block text-sm font-semibold", active ? "text-primary" : "text-foreground")}>
                          {m.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{m.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* additional options */}
            <section>
              <h2 className="text-lg font-bold text-foreground">Additional options</h2>
              <p className="mt-1 text-sm text-body">
                Customize your invoice with additional fields to better suit your business needs.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="mb-1.5 text-foreground">Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Select a template…" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoiceTemplates.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 text-foreground">Memo (optional)</Label>
                  <Textarea
                    placeholder="Thank you for your business!"
                    className="min-h-16 rounded-xl"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ----------------- preview ----------------- */}
        {showPreview && (
          <aside className="hidden w-[46%] shrink-0 border-l border-border bg-background lg:block">
            <div className="px-8 py-8">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Preview</h2>
              </div>
              <div className="flex gap-5 border-b border-border">
                {(
                  [
                    ["pdf", "Invoice PDF"],
                    ["email", "Email"],
                    ["payment", "Payment page"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setPreviewTab(key)}
                    className={cn(
                      "border-b-2 pb-2.5 text-sm font-medium transition-colors",
                      previewTab === key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                {previewTab === "pdf" && (
                  <div className="rounded-lg bg-white p-7 text-[13px] text-neutral-800 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-start justify-between">
                      <p className="text-xl font-bold text-neutral-900">Invoice</p>
                      <p className="font-semibold text-neutral-400">{businessName}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-xs">
                      <span className="text-neutral-500">Invoice number</span>
                      <span className="text-neutral-800">{INVOICE_NO}</span>
                      <span className="text-neutral-500">Date of issue</span>
                      <span className="text-neutral-800">{ISSUE_DATE}</span>
                      <span className="text-neutral-500">Date due</span>
                      <span className="text-neutral-800">{DUE_DATE}</span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-neutral-900">{businessName}</p>
                        <p className="text-neutral-500">{selected?.country || "United States"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">Bill to</p>
                        <p className="text-neutral-500">{billTo}</p>
                      </div>
                    </div>
                    <p className="mt-5 text-lg font-bold text-neutral-900">
                      {formatMoney(total, cur)} due {DUE_DATE}
                    </p>
                    <div className="mt-4 border-t border-neutral-200 pt-2">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Description</span>
                        <span className="flex gap-6">
                          <span className="w-8 text-right">Qty</span>
                          <span className="w-16 text-right">Unit price</span>
                          <span className="w-16 text-right">Amount</span>
                        </span>
                      </div>
                      {lines.length === 0 ? (
                        <p className="py-3 text-xs text-neutral-400">No items yet</p>
                      ) : (
                        lines.map((l) => (
                          <div key={l.id} className="flex items-center justify-between py-1.5 text-xs">
                            <span className="truncate text-neutral-800">{l.description || "Item"}</span>
                            <span className="flex gap-6">
                              <span className="w-8 text-right text-neutral-800">{l.qty}</span>
                              <span className="w-16 text-right text-neutral-800">{formatMoney(l.unitPrice, cur)}</span>
                              <span className="w-16 text-right text-neutral-800">{formatMoney(l.qty * l.unitPrice, cur)}</span>
                            </span>
                          </div>
                        ))
                      )}
                      <div className="mt-2 space-y-1 border-t border-neutral-200 pt-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Subtotal</span>
                          <span className="text-neutral-800">{formatMoney(subtotal, cur)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Total</span>
                          <span className="text-neutral-800">{formatMoney(total, cur)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-neutral-900">Amount due</span>
                          <span className="text-neutral-900">{formatMoney(total, cur)} {cur}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-6 border-t border-neutral-200 pt-3 text-[11px] text-neutral-400">
                      {INVOICE_NO} · {formatMoney(total, cur)} {cur} due {DUE_DATE}
                    </p>
                  </div>
                )}

                {previewTab === "email" && (
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
                      <span className="text-sm font-semibold">{businessName}</span>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground">Invoice from {businessName}</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{formatMoney(total, cur)}</p>
                      <p className="text-xs text-muted-foreground">Due {DUE_DATE} · Invoice {INVOICE_NO}</p>
                      <button
                        className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        Pay this invoice
                      </button>
                    </div>
                  </div>
                )}

                {previewTab === "payment" && (
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="p-5 text-white" style={{ backgroundColor: brandColor }}>
                      <span className="text-sm font-semibold">{businessName}</span>
                      <p className="mt-3 text-2xl font-bold">{formatMoney(total, cur)}</p>
                      <p className="text-sm text-white/70">Due {DUE_DATE}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-sm text-white/80">
                        View invoice and payment details <ChevronRight size={14} />
                      </p>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                        <span className="text-muted-foreground">To</span>
                        <span className="text-foreground">{billTo}</span>
                        <span className="text-muted-foreground">From</span>
                        <span className="text-foreground">{businessName}</span>
                        <span className="text-muted-foreground">Invoice</span>
                        <span className="text-foreground">{INVOICE_NO}</span>
                      </div>
                      <button
                        className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        Pay {formatMoney(total, cur)}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                💡 Tip: Change how this page looks in branding.
              </p>
            </div>
          </aside>
        )}
      </div>

      <CreateCustomerModal
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onCreated={(c: CustomerItem) => setCustomerId(c.id)}
      />
    </div>
  );
}
