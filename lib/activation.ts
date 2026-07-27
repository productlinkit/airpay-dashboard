// Service Activation model (PRD 5.3 / Flow 6.4) — activate DCB & Digital Payment from the dashboard.

export type ProductKey = "dcb" | "digital";

/** FR-ACT-7 per-product status lifecycle. */
export type ActStatus = "not_activated" | "in_progress" | "in_review" | "live" | "rejected";

export type ActTone = "neutral" | "info" | "success" | "danger";

export const actStatusMeta: Record<ActStatus, { label: string; tone: ActTone; description: string }> = {
  not_activated: {
    label: "Not activated",
    tone: "neutral",
    description: "Activate this product to accept live payments.",
  },
  in_progress: {
    label: "In progress",
    tone: "info",
    description: "Finish the requirements and submit for review.",
  },
  in_review: {
    label: "In review",
    tone: "info",
    description: "Our team is reviewing your activation — usually 1–2 business days.",
  },
  live: {
    label: "Live",
    tone: "success",
    description: "This product is live. Production credentials are available in Developers.",
  },
  rejected: {
    label: "Rejected",
    tone: "danger",
    description: "Activation was unsuccessful — review and resubmit.",
  },
};

/** Stepper stages shown while an activation is in flight (FR-ACT-7). */
export const actStages = ["In progress", "Submitted", "In Review", "Live"] as const;
export function actStageIndex(s: ActStatus): number {
  switch (s) {
    case "not_activated":
    case "in_progress":
      return 0;
    case "in_review":
      return 2;
    case "live":
      return 3;
    case "rejected":
      return 2;
  }
}

/** FR-ACT-3: Digital Payment channels to enable. */
export const digitalChannels: { key: string; label: string; hint: string }[] = [
  { key: "ewallet", label: "E-wallet", hint: "OVO, GoPay, DANA, ShopeePay" },
  { key: "va", label: "Virtual Account", hint: "Bank transfer via VA number" },
  { key: "card", label: "Card", hint: "Credit & debit cards" },
  { key: "qris", label: "QRIS", hint: "Universal QR standard" },
];

/** FR-ACT-2: service documents required to activate DCB. */
export const dcbDocuments: { key: string; label: string; hint: string }[] = [
  { key: "service", label: "Service description", hint: "What content/service is billed via DCB" },
  { key: "compliance", label: "Content compliance statement", hint: "PDF, JPG or PNG · max 5MB" },
];

export type Activation = {
  status: ActStatus;
  agreementAccepted: boolean;
  channels: string[]; // Digital Payment
  docs: Record<string, string>; // DCB service docs (key → uploaded file name)
  reviewNote?: string;
};

export const emptyActivation: Activation = {
  status: "not_activated",
  agreementAccepted: false,
  channels: [],
  docs: {},
};

export type Activations = Record<ProductKey, Activation>;
export const emptyActivations: Activations = {
  dcb: { ...emptyActivation },
  digital: { ...emptyActivation },
};

export const productMeta: Record<
  ProductKey,
  { name: string; short: string; desc: string; agreementParty: string; countries: string[] }
> = {
  dcb: {
    name: "Direct Carrier Billing",
    short: "DCB",
    desc: "Charge payments to the customer's mobile operator bill (pulsa / postpaid).",
    agreementParty: "the telco partner",
    // FR-ACT-10: DCB only where there's a telco partnership.
    countries: ["Indonesia", "Malaysia", "Philippines", "Thailand"],
  },
  digital: {
    name: "Digital Payment",
    short: "Digital Payment",
    desc: "Accept e-wallet, Virtual Account, card, and QRIS payments.",
    agreementParty: "the payment service provider (PSP)",
    countries: ["Indonesia", "Malaysia", "Philippines", "Thailand", "Vietnam"],
  },
};

export const productKeys: ProductKey[] = ["dcb", "digital"];

/** FR-ACT-10: is the product available in the merchant's country? */
export function isProductAvailable(product: ProductKey, country: string): boolean {
  return productMeta[product].countries.includes(country);
}
