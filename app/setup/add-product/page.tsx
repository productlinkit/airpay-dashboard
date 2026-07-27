"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, ChevronDown, Info, BadgeCheck, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { TextField } from "@/components/auth/ui";
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
  productLocations,
  billingPeriods,
  billingPeriodSuffix,
  allSellCategories,
  currencySymbol,
  formatMoney,
  PAYMENTS_TASKS,
  type ProductItem,
} from "@/lib/setup";

export default function AddProductPage() {
  const ob = useOnboarding();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  // Product details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(ob.sellCategory || "");
  const [imageName, setImageName] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [moreOptions, setMoreOptions] = useState(false);
  const [statementDescriptor, setStatementDescriptor] = useState("");
  const [unitLabel, setUnitLabel] = useState("");

  // Pricing
  const [billing, setBilling] = useState<"recurring" | "one_time">("recurring");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(ob.products[0]?.currency || "IDR");
  const [includeTax, setIncludeTax] = useState<"No" | "Yes">("No");
  const [billingPeriod, setBillingPeriod] = useState("Monthly");

  // Preview
  const [unitQty, setUnitQty] = useState("1");
  const [locationKey, setLocationKey] = useState("ID");

  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  function pickImage(file?: File) {
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  // ---- live estimate ----
  const estimate = useMemo(() => {
    const qty = Math.max(0, parseInt(unitQty || "0", 10) || 0);
    const amt = parseFloat(amount) || 0;
    const line = qty * amt;
    const loc = productLocations.find((l) => l.key === locationKey) ?? productLocations[0];
    const rate = loc.rate / 100;
    let subtotal: number;
    let tax: number;
    let total: number;
    if (includeTax === "Yes") {
      total = line;
      subtotal = rate > 0 ? line / (1 + rate) : line;
      tax = total - subtotal;
    } else {
      subtotal = line;
      tax = line * rate;
      total = line + tax;
    }
    return { qty, amt, line, loc, subtotal, tax, total };
  }, [unitQty, amount, locationKey, includeTax]);

  const totalLabel =
    billing === "recurring" ? `Total ${billingPeriodSuffix[billingPeriod] ?? "per period"}` : "Total";

  function save() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!amount || Number.isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      e.amount = "Amount is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const product: ProductItem = {
      id: `prod_${Date.now().toString(36)}`,
      name: name.trim(),
      description: description.trim(),
      amount,
      currency,
      image: imageName,
      billing,
      billingPeriod: billing === "recurring" ? billingPeriod : undefined,
      category: category || undefined,
    };
    ob.addProduct(product);
    ob.setTask(PAYMENTS_TASKS.product, true);
    toast.success(`“${product.name}” added to your product catalog.`);
    router.push("/");
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-0 lg:grid-cols-[1fr_340px]">
      {/* ---------------- form ---------------- */}
      <div className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
            Add a product
          </h1>
          <p className="mt-2 text-[15px] text-body">
            Create a one-off or recurring product. It appears in your product catalog and at checkout.
          </p>

          <div className="mt-6 space-y-5">
            {/* name */}
            <div>
              <TextField
                label="Name (required)"
                name="name"
                placeholder="Name of the product or service, visible to customers"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                error={errors.name}
              />
              {!errors.name && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Name of the product or service, visible to customers.
                </p>
              )}
            </div>

            {/* description */}
            <div>
              <Label className="mb-1.5 text-foreground">Description</Label>
              <Textarea
                placeholder="Appears at checkout, on the customer portal, and in quotes."
                className="min-h-24 rounded-xl"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* image */}
            <div>
              <Label className="mb-1 text-foreground">Image</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Appears at checkout. JPEG, PNG, or WEBP under 2MB.
              </p>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0])}
              />
              {imageUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm text-body">{imageName}</span>
                  <button
                    onClick={() => {
                      setImageUrl(undefined);
                      setImageName(undefined);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <Button variant="outline" className="rounded-xl" onClick={() => fileInput.current?.click()}>
                  <ImagePlus size={16} /> Upload
                </Button>
              )}
            </div>

            {/* product category */}
            <div>
              <Label className="mb-1 text-foreground">Product category</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                This will be used for calculating automatic tax.{" "}
                <button
                  onClick={() => toast.info("Opening documentation (demo).")}
                  className="font-semibold text-primary hover:underline"
                >
                  View docs
                </button>
              </p>
              <Select value={category || undefined} onValueChange={setCategory}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Select a product category" />
                </SelectTrigger>
                <SelectContent>
                  {allSellCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {category && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-success">
                  <BadgeCheck size={14} /> Eligible for Managed Payments
                </p>
              )}
            </div>

            {/* more options */}
            <div>
              <button
                onClick={() => setMoreOptions((v) => !v)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                More options
                <ChevronDown size={15} className={cn("transition-transform", moreOptions && "rotate-180")} />
              </button>
              {moreOptions && (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Statement descriptor"
                    name="statementDescriptor"
                    placeholder="APPEARS ON STATEMENTS"
                    value={statementDescriptor}
                    onChange={(e) => setStatementDescriptor(e.target.value)}
                  />
                  <TextField
                    label="Unit label"
                    name="unitLabel"
                    placeholder="e.g. seat, license"
                    value={unitLabel}
                    onChange={(e) => setUnitLabel(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="border-t border-border pt-5">
              <p className="text-base font-bold text-foreground">Pricing</p>

              {/* recurring / one-off */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(
                  [
                    ["recurring", "Recurring"],
                    ["one_time", "One-off"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBilling(key)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                      billing === key
                        ? "border-primary text-primary"
                        : "border-border text-body hover:border-primary/40",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* amount + currency */}
              <div className="mt-4">
                <Label className="mb-1.5 text-foreground">Amount (required)</Label>
                <div className="flex items-stretch gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {currencySymbol(currency)}
                    </span>
                    <Input
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                        setErrors((p) => ({ ...p, amount: undefined }));
                      }}
                      aria-invalid={!!errors.amount}
                      className={cn(
                        "h-11 rounded-xl pl-9",
                        currency === "IDR" && "pl-11",
                        errors.amount && "border-destructive",
                      )}
                    />
                  </div>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-11 w-24 shrink-0 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productCurrencies.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.amount && <p className="mt-1.5 text-xs text-destructive">{errors.amount}</p>}
              </div>

              {/* include tax */}
              <div className="mt-4">
                <Label className="mb-1.5 flex items-center gap-1 text-foreground">
                  Include tax in price <Info size={13} className="text-muted-foreground" />
                </Label>
                <Select value={includeTax} onValueChange={(v) => setIncludeTax(v as "No" | "Yes")}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* billing period (recurring only) */}
              {billing === "recurring" && (
                <div className="mt-4">
                  <Label className="mb-1.5 text-foreground">Billing period</Label>
                  <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {billingPeriods.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <button
                onClick={() => toast.info("More pricing options (demo).")}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                More pricing options
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={save}>
              Add product
            </Button>
          </div>
        </div>
      </div>

      {/* ---------------- preview ---------------- */}
      <aside className="border-t border-border bg-background px-6 py-10 lg:border-l lg:border-t-0 lg:px-7">
        <h2 className="text-lg font-bold text-foreground">Preview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estimate totals based on pricing model, unit quantity, and tax.
        </p>

        <div className="mt-5">
          <Label className="mb-1.5 text-foreground">Unit quantity</Label>
          <Input
            inputMode="numeric"
            value={unitQty}
            onChange={(e) => setUnitQty(e.target.value.replace(/[^0-9]/g, ""))}
            className="h-11 rounded-xl bg-card"
          />
        </div>

        <div className="mt-4">
          <Label className="mb-1.5 text-foreground">Location</Label>
          <Select value={locationKey} onValueChange={setLocationKey}>
            <SelectTrigger className="h-11 w-full rounded-xl bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productLocations.map((l) => (
                <SelectItem key={l.key} value={l.key}>
                  {l.flag} {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="mt-5 text-sm text-body">
          {estimate.qty} {unitLabel || ""} × {formatMoney(estimate.amt, currency)} ={" "}
          <span className="font-bold text-foreground">{formatMoney(estimate.line, currency)}</span>
        </p>

        <div className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-body">Subtotal</span>
            <span className="font-medium text-foreground">{formatMoney(estimate.subtotal, currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-body">
              {estimate.loc.taxLabel} {estimate.loc.rate}%
              <span className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-1.5 py-0.5 text-[11px] font-medium text-primary">
                <Info size={11} /> Managed for you
              </span>
            </span>
            <span className="font-medium text-foreground">{formatMoney(estimate.tax, currency)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2.5">
            <span className="font-semibold text-foreground">{totalLabel}</span>
            <span className="font-bold text-foreground">{formatMoney(estimate.total, currency)}</span>
          </div>
          {billing === "recurring" && (
            <p className="text-xs text-muted-foreground">Billed at the start of the period.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
