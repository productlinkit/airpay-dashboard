"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  emptyKyb,
  statusMeta,
  type AccountType,
  type KybData,
  type OnbStatus,
  type HistoryEntry,
} from "@/lib/onboarding";
import {
  defaultBranding,
  defaultReminders,
  type ProductItem,
  type BrandingData,
  type CustomerItem,
  type RemindersData,
} from "@/lib/setup";
import {
  emptyActivations,
  type Activations,
  type Activation,
  type ProductKey,
} from "@/lib/activation";

type OnboardingState = {
  status: OnbStatus;
  accountType: AccountType;
  kyb: KybData;
  reviewNote: string;
  history: HistoryEntry[];
  /** Wizard step to resume on (saved as the user progresses / closes). */
  draftStep: number;
  /** Account email captured at register/login — shown in the verification modal. */
  email: string;
  /** Step 1 of setup: email confirmed. Business verification is gated behind this. */
  emailVerified: boolean;
  /** Whether the first-time email prompt has auto-opened once already. */
  emailPromptSeen: boolean;
  /** Signed in — the dashboard is gated behind this; entry point is /login. */
  authed: boolean;
  /** Setup guide task completion (Manage Payment / Payments / Invoices), keyed by task id. */
  tasks: Record<string, boolean>;
  /** "Set up Manage Payment" — selected product tax category ("Tell us what you sell most"). */
  sellCategory: string;
  /** "Set up Payments" — chosen "how to accept payments" integration key. */
  acceptMethod: string;
  /** Products created via the "Add a product" flow. */
  products: ProductItem[];
  /** "Set up invoices" — brand elements from the Branding settings modal. */
  branding: BrandingData;
  /** Customers created via the "Create a customer" flow. */
  customers: CustomerItem[];
  /** "Set up invoices" — automatic payment reminder schedule. */
  reminders: RemindersData;
  /** Live account active (switched from sandbox). Requires verified email + business. */
  live: boolean;
  /** Service activation state per product (DCB / Digital Payment) — PRD 5.3. */
  activations: Activations;
};

type OnboardingContextValue = OnboardingState & {
  ready: boolean;
  setAccountType: (t: AccountType) => void;
  /** Persist wizard data; optionally the step to resume on. */
  saveDraft: (kyb: KybData, step?: number) => void;
  submit: (kyb: KybData) => void;
  /** Simulated admin decision (FR-ONB-8). */
  decide: (status: OnbStatus, note?: string) => void;
  /** Start a fresh account (register): reset everything, keep only the email; signs in. */
  startAccount: (email: string) => void;
  /** Sign in a returning user (login) — sets the account email. */
  signIn: (email: string) => void;
  /** Sign out — returns the user to /login. */
  signOut: () => void;
  /** Update the account email without resetting (returning login). */
  setEmail: (email: string) => void;
  /** Step 1 complete — email confirmed. */
  verifyEmail: () => void;
  /** Record that the first-time email prompt has been shown. */
  markEmailPromptSeen: () => void;
  /** Mark a Setup guide task done/undone. */
  setTask: (key: string, done: boolean) => void;
  /** Persist the selected "Tell us what you sell most" category. */
  setSellCategory: (category: string) => void;
  /** Persist the chosen "how to accept payments" integration. */
  setAcceptMethod: (key: string) => void;
  /** Add a product created in the "Add a product" flow. */
  addProduct: (product: ProductItem) => void;
  /** Persist brand elements from the Branding settings modal. */
  saveBranding: (branding: BrandingData) => void;
  /** Add a customer created in the "Create a customer" flow. */
  addCustomer: (customer: CustomerItem) => void;
  /** Persist the automatic payment reminder schedule. */
  saveReminders: (reminders: RemindersData) => void;
  /** Switch between the live account and sandbox. */
  setLive: (live: boolean) => void;
  /** Save an activation draft (FR-ACT-1..3) — bumps status to in_progress. */
  saveActivation: (
    product: ProductKey,
    data: Pick<Activation, "agreementAccepted" | "channels" | "docs">,
  ) => void;
  /** Submit an activation for admin review (FR-ACT-4). */
  submitActivation: (
    product: ProductKey,
    data: Pick<Activation, "agreementAccepted" | "channels" | "docs">,
  ) => void;
  /** Simulated admin decision on an activation (FR-ACT-4/5). */
  decideActivation: (product: ProductKey, status: "live" | "rejected", note?: string) => void;
  reset: () => void;
};

const STORAGE_KEY = "airpay.onboarding.v1";

const initial: OnboardingState = {
  status: "not_started",
  accountType: "Merchant",
  kyb: emptyKyb,
  reviewNote: "",
  history: [],
  draftStep: 0,
  email: "",
  emailVerified: false,
  emailPromptSeen: false,
  authed: false,
  tasks: {},
  sellCategory: "",
  acceptMethod: "",
  products: [],
  branding: defaultBranding,
  customers: [],
  reminders: defaultReminders,
  live: false,
  activations: emptyActivations,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function now(): string {
  return new Date().toISOString();
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initial);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, ready]);

  function pushHistory(prev: OnboardingState, status: OnbStatus, note?: string): HistoryEntry[] {
    return [
      { status, label: statusMeta[status].label, note, at: now() },
      ...prev.history,
    ];
  }

  const value: OnboardingContextValue = {
    ...state,
    ready,
    setAccountType: (accountType) => setState((s) => ({ ...s, accountType })),
    saveDraft: (kyb, step) =>
      setState((s) => ({
        ...s,
        kyb,
        draftStep: step ?? s.draftStep,
        status: s.status === "not_started" ? "draft" : s.status,
      })),
    submit: (kyb) =>
      setState((s) => ({
        ...s,
        kyb,
        status: "in_review",
        reviewNote: "",
        history: pushHistory(s, "in_review"),
      })),
    decide: (status, note) =>
      setState((s) => ({
        ...s,
        status,
        reviewNote: note ?? "",
        // Can't stay on the live account if the business is no longer verified.
        live: status === "verified" ? s.live : false,
        history: pushHistory(s, status, note),
      })),
    startAccount: (email) => setState({ ...initial, email, authed: true }),
    signIn: (email) => setState((s) => ({ ...s, email, authed: true })),
    signOut: () => setState((s) => ({ ...s, authed: false })),
    setEmail: (email) => setState((s) => ({ ...s, email })),
    verifyEmail: () => setState((s) => ({ ...s, emailVerified: true, emailPromptSeen: true })),
    markEmailPromptSeen: () => setState((s) => ({ ...s, emailPromptSeen: true })),
    setTask: (key, done) => setState((s) => ({ ...s, tasks: { ...s.tasks, [key]: done } })),
    setSellCategory: (sellCategory) => setState((s) => ({ ...s, sellCategory })),
    setAcceptMethod: (acceptMethod) => setState((s) => ({ ...s, acceptMethod })),
    addProduct: (product) => setState((s) => ({ ...s, products: [product, ...s.products] })),
    saveBranding: (branding) => setState((s) => ({ ...s, branding })),
    addCustomer: (customer) => setState((s) => ({ ...s, customers: [customer, ...s.customers] })),
    saveReminders: (reminders) => setState((s) => ({ ...s, reminders })),
    setLive: (live) => setState((s) => ({ ...s, live })),
    saveActivation: (product, data) =>
      setState((s) => {
        const prev = s.activations[product];
        return {
          ...s,
          activations: {
            ...s.activations,
            [product]: {
              ...prev,
              ...data,
              status: prev.status === "not_activated" ? "in_progress" : prev.status,
            },
          },
        };
      }),
    submitActivation: (product, data) =>
      setState((s) => ({
        ...s,
        activations: {
          ...s.activations,
          [product]: { ...s.activations[product], ...data, status: "in_review", reviewNote: "" },
        },
      })),
    decideActivation: (product, status, note) =>
      setState((s) => ({
        ...s,
        activations: {
          ...s.activations,
          [product]: { ...s.activations[product], status, reviewNote: note ?? "" },
        },
      })),
    // Reset onboarding progress but stay signed in (keeps the account/email).
    reset: () => setState((s) => ({ ...initial, authed: s.authed, email: s.email })),
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
