// Setup-flow data models (Stripe-style "Set up ..." guides launched from the dashboard Setup guide).

/* ------------------------------ Manage Payment ----------------------------- */

/** Task keys tracked by the dashboard Setup guide for the Manage Payment section. */
export const MANAGE_TASKS = {
  start: "manage-start",
  selling: "manage-selling",
} as const;

/** Popular categories shown as quick-pick radios in "Tell us what you sell most". */
export const popularSellCategories = [
  "Software as a service (SaaS) — business use",
  "Software as a service (SaaS) — personal use",
  "Video games — downloaded, non-subscription, permanent rights",
];

/** Full product tax-category tree for the "Choose something else" browser. */
export const sellCategoryTree: { group: string; items: string[] }[] = [
  {
    group: "Digital products",
    items: [
      "Software as a service (SaaS) — business use",
      "Software as a service (SaaS) — personal use",
      "Downloadable software",
      "Digital top-ups & vouchers",
      "Video games — downloaded, non-subscription, permanent rights",
      "Streaming subscription",
      "E-books & digital media",
    ],
  },
  {
    group: "Physical goods",
    items: ["General retail goods", "Apparel & accessories", "Electronics", "Food & beverage"],
  },
  {
    group: "Services",
    items: ["Professional services", "Education & courses", "Travel & transport", "Consulting"],
  },
  {
    group: "Events and admissions",
    items: ["Event tickets", "Memberships", "Admissions"],
  },
  {
    group: "Other",
    items: ["Donations", "Something else"],
  },
];

/* -------------------------------- Payments -------------------------------- */

export const PAYMENTS_TASKS = {
  accept: "pay-accept",
  checkout: "pay-checkout",
  product: "pay-product",
} as const;

/** "How do you want to accept payments?" integration options. */
export const acceptPaymentOptions: { key: string; title: string; desc: string }[] = [
  {
    key: "links",
    title: "Shareable payment links",
    desc: "Use Payment Links to share a payment page with your customers over email, SMS, or social media.",
  },
  {
    key: "checkout",
    title: "Prebuilt checkout form",
    desc: "Use AirPay Checkout to embed a payment form on your site or redirect to an AirPay-hosted page.",
  },
];

export const productCurrencies = ["IDR", "USD", "SGD", "MYR"];

/** Preview locations with their automatic-tax label + rate. */
export const productLocations: { key: string; label: string; flag: string; taxLabel: string; rate: number }[] = [
  { key: "ID", label: "Indonesia", flag: "🇮🇩", taxLabel: "PPN", rate: 11 },
  { key: "AU", label: "Australia", flag: "🇦🇺", taxLabel: "GST", rate: 10 },
  { key: "SG", label: "Singapore", flag: "🇸🇬", taxLabel: "GST", rate: 9 },
  { key: "MY", label: "Malaysia", flag: "🇲🇾", taxLabel: "SST", rate: 6 },
  { key: "US", label: "United States", flag: "🇺🇸", taxLabel: "Sales tax", rate: 0 },
];

export const billingPeriods = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

/** Suffix shown on the recurring total, e.g. "per month". */
export const billingPeriodSuffix: Record<string, string> = {
  Daily: "per day",
  Weekly: "per week",
  Monthly: "per month",
  Quarterly: "per quarter",
  Yearly: "per year",
};

/** All sell categories flattened, for the product-category picker. */
export const allSellCategories = sellCategoryTree.flatMap((g) => g.items);

export type ProductItem = {
  id: string;
  name: string;
  description: string;
  amount: string;
  currency: string;
  image?: string; // uploaded file name (fake)
  billing: "one_time" | "recurring";
  billingPeriod?: string;
  category?: string;
};

const currencySymbols: Record<string, string> = { IDR: "Rp", USD: "$", SGD: "S$", MYR: "RM" };

export function currencySymbol(currency: string): string {
  return currencySymbols[currency] ?? `${currency} `;
}

/** Format a numeric amount + currency for display (IDR has no decimals). */
export function formatMoney(amount: number | string, currency: string): string {
  const n = typeof amount === "number" ? amount : parseFloat(amount);
  if (Number.isNaN(n)) return "—";
  const symbol = currencySymbol(currency);
  if (currency === "IDR") return `${symbol} ${Math.round(n).toLocaleString("en-US")}`;
  return `${symbol}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* -------------------------------- Invoices -------------------------------- */

export const INVOICE_TASKS = {
  branding: "inv-branding",
  customer: "inv-customer",
  invoice: "inv-invoice",
  reminders: "inv-reminders",
} as const;

/** Brand elements set in the "Branding settings" modal. */
export type BrandingData = {
  icon?: string; // data URL
  logo?: string; // data URL
  preferLogo: boolean;
  brandColor: string;
  accentColor: string;
};

export const defaultBranding: BrandingData = {
  preferLogo: false,
  brandColor: "#8169ff",
  accentColor: "#8169ff",
};

/** Invoice templates offered in the "Create an invoice" flow (demo). */
export const invoiceTemplates = ["Default", "Minimal", "Detailed", "Proforma"];

/* ------------------------------ Reminders ------------------------------ */

export type ReminderTiming = "before" | "on" | "after";
export type ReminderRule = { id: string; days: number; timing: ReminderTiming };
export type RemindersData = { enabled: boolean; rules: ReminderRule[] };

export const defaultReminders: RemindersData = {
  enabled: true,
  rules: [
    { id: "r1", days: 7, timing: "before" },
    { id: "r2", days: 0, timing: "on" },
    { id: "r3", days: 3, timing: "after" },
    { id: "r4", days: 7, timing: "after" },
  ],
};

/** Human label for a reminder rule, e.g. "7 days before the due date". */
export function reminderLabel(r: ReminderRule): string {
  if (r.timing === "on") return "On the due date";
  return `${r.days} ${r.days === 1 ? "day" : "days"} ${r.timing} the due date`;
}

/** A customer created via the "Create a customer" flow. */
export type CustomerItem = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  country: string;
  line1?: string;
  city?: string;
  state?: string;
  postal?: string;
};

/** Preview surfaces in the branding modal (tabs). */
export const brandingTabs = [
  "Email receipts",
  "Checkout & Payment Links",
  "Customer portal",
  "Invoice",
  "Identity",
  "Global payouts",
] as const;
export type BrandingTab = (typeof brandingTabs)[number];
