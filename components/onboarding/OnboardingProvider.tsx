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
};

type OnboardingContextValue = OnboardingState & {
  ready: boolean;
  setAccountType: (t: AccountType) => void;
  /** Persist wizard data; optionally the step to resume on. */
  saveDraft: (kyb: KybData, step?: number) => void;
  submit: (kyb: KybData) => void;
  /** Simulated admin decision (FR-ONB-8). */
  decide: (status: OnbStatus, note?: string) => void;
  /** Start a fresh account (register): reset everything, keep only the email. */
  startAccount: (email: string) => void;
  /** Update the account email without resetting (returning login). */
  setEmail: (email: string) => void;
  /** Step 1 complete — email confirmed. */
  verifyEmail: () => void;
  /** Record that the first-time email prompt has been shown. */
  markEmailPromptSeen: () => void;
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
        history: pushHistory(s, status, note),
      })),
    startAccount: (email) => setState({ ...initial, email }),
    setEmail: (email) => setState((s) => ({ ...s, email })),
    verifyEmail: () => setState((s) => ({ ...s, emailVerified: true, emailPromptSeen: true })),
    markEmailPromptSeen: () => setState((s) => ({ ...s, emailPromptSeen: true })),
    reset: () => setState({ ...initial }),
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
