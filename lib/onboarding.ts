// Onboarding / KYB model for the AirPay dashboard (frontend slice of PRD 5.2, Flow 6.2).

export type AccountType = "Merchant" | "Partner";

/** FR-ONB-7 status lifecycle: Draft → Submitted → In Review → Verified / Rejected / Need More Info. */
export type OnbStatus =
  | "not_started"
  | "draft"
  | "in_review"
  | "need_more_info"
  | "verified"
  | "rejected";

export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger";

export const statusMeta: Record<
  OnbStatus,
  { label: string; tone: StatusTone; description: string }
> = {
  not_started: {
    label: "Not started",
    tone: "neutral",
    description: "Complete business verification (KYB) to go live.",
  },
  draft: {
    label: "Draft",
    tone: "neutral",
    description: "Your verification is saved as a draft. Finish and submit it to go live.",
  },
  in_review: {
    label: "In Review",
    tone: "info",
    description: "Our team is reviewing your business details. This usually takes 1–2 business days.",
  },
  need_more_info: {
    label: "Need More Info",
    tone: "warning",
    description: "We need a few more details before we can verify your business.",
  },
  verified: {
    label: "Verified",
    tone: "success",
    description: "Your business is verified. You can now activate a product to accept live payments.",
  },
  rejected: {
    label: "Rejected",
    tone: "danger",
    description: "We couldn't verify your business with the details provided.",
  },
};

/** Stepper stages shown during onboarding (FR-ONB-7). */
export const statusStages = ["Draft", "Submitted", "In Review", "Verified"] as const;

export function stageIndex(status: OnbStatus): number {
  switch (status) {
    case "not_started":
    case "draft":
      return 0;
    case "in_review":
    case "need_more_info":
      return 2;
    case "verified":
      return 3;
    case "rejected":
      return 2;
  }
}

/** FR-ONB-5: legal entity type of the business (Indonesia set), shown as selectable cards. */
export const businessTypes: { value: string; desc: string }[] = [
  { value: "PT (Perseroan Terbatas)", desc: "Limited liability company registered with the government." },
  { value: "CV (Commanditaire Vennootschap)", desc: "Partnership with active and silent partners." },
  { value: "Perorangan / Sole Proprietor", desc: "Owned by one person; may be unregistered." },
  { value: "Firma", desc: "General partnership between two or more people." },
  { value: "Koperasi", desc: "Member-owned cooperative (koperasi)." },
  { value: "Yayasan", desc: "Foundation or non-profit organization." },
  { value: "Other", desc: "A business type not listed above." },
];

export const industries = [
  "Retail & E-commerce",
  "Digital Goods & Gaming",
  "Food & Beverage",
  "Travel & Hospitality",
  "Education",
  "Financial Services",
  "Media & Entertainment",
  "Telecommunications",
  "Other",
];

export const countries = [
  "Indonesia",
  "Malaysia",
  "Philippines",
  "Thailand",
  "Vietnam",
];

/** FR-ONB-5 / FR-GEO-2: baseline KYB documents (Indonesia set). */
export const requiredDocuments = [
  { key: "nib", label: "Business registration (NIB / SIUP / Akta)", hint: "PDF, JPG or PNG · max 5MB" },
  { key: "npwp", label: "Tax ID (NPWP)", hint: "PDF, JPG or PNG · max 5MB" },
  { key: "ktp", label: "PIC identity (KTP / Passport)", hint: "PDF, JPG or PNG · max 5MB" },
];

export type KybData = {
  legalName: string;
  businessType: string;
  taxId: string;
  industry: string;
  country: string;
  website: string;
  description: string;
  picName: string;
  picRole: string;
  picEmail: string;
  picPhone: string;
  addressStreet: string;
  addressCity: string;
  addressProvince: string;
  addressPostal: string;
  documents: Record<string, string>; // key -> uploaded file name
};

export const emptyKyb: KybData = {
  legalName: "",
  businessType: "",
  taxId: "",
  industry: "",
  country: "Indonesia",
  website: "",
  description: "",
  picName: "",
  picRole: "",
  picEmail: "",
  picPhone: "",
  addressStreet: "",
  addressCity: "",
  addressProvince: "",
  addressPostal: "",
  documents: {},
};

export type HistoryEntry = { status: OnbStatus; label: string; note?: string; at: string };
