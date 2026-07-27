"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Check,
  ShieldCheck,
  Signal,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { WizardNav, type WizardGroup } from "@/components/onboarding/WizardNav";
import { DocumentField } from "@/components/onboarding/DocumentField";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  productMeta,
  digitalChannels,
  dcbDocuments,
  isProductAvailable,
  type ProductKey,
} from "@/lib/activation";

function StepHeading({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-[15px] text-body">{desc}</p>
    </div>
  );
}

function GateCard({
  icon,
  title,
  desc,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <Card className="items-center gap-0 rounded-2xl p-8 text-center shadow-none">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          {icon}
        </span>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-body">{desc}</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href={cta.href}>
            <ArrowLeft size={16} /> {cta.label}
          </Link>
        </Button>
      </Card>
    </div>
  );
}

function ActivateInner() {
  const ob = useOnboarding();
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("product");
  const product: ProductKey = raw === "dcb" ? "dcb" : "digital";
  const meta = productMeta[product];

  const existing = ob.activations[product];
  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState(existing.agreementAccepted);
  const [channels, setChannels] = useState<string[]>(existing.channels);
  const [docs, setDocs] = useState<Record<string, string>>(existing.docs);
  const [error, setError] = useState("");

  if (!ob.ready) {
    return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  }

  // Gate 1: business must be verified to activate a product (PRD journey: verify → activate).
  if (ob.status !== "verified") {
    return (
      <GateCard
        icon={<ShieldCheck size={26} />}
        title="Verify your business first"
        desc="Products are activated after your business is verified. Complete business verification, then come back to go live."
        cta={{ label: "Verify your business", href: "/onboarding" }}
      />
    );
  }

  // Gate 2: FR-ACT-10 — product availability per country.
  if (!isProductAvailable(product, ob.kyb.country)) {
    return (
      <GateCard
        icon={<Globe size={26} />}
        title={`${meta.short} isn't available in ${ob.kyb.country}`}
        desc={`We don't have a ${product === "dcb" ? "telco" : "PSP"} partnership in your country yet for this product.`}
        cta={{ label: "Back to products", href: "/products" }}
      />
    );
  }

  // Already submitted / live — nothing to fill.
  if (existing.status === "in_review" || existing.status === "live") {
    return (
      <GateCard
        icon={existing.status === "live" ? <Check size={26} /> : <Signal size={26} />}
        title={existing.status === "live" ? `${meta.short} is live` : `${meta.short} is in review`}
        desc={
          existing.status === "live"
            ? "This product is already activated. Production credentials are available in Developers."
            : "We're reviewing your activation. You'll be notified when it goes live."
        }
        cta={{ label: "Back to products", href: "/products" }}
      />
    );
  }

  const reqStepLabel = product === "dcb" ? "Documents" : "Channels";
  const groups: WizardGroup[] = [
    { label: `Activate ${meta.short}`, steps: ["Overview", "Agreement", reqStepLabel, "Review"] },
  ];
  const TOTAL = 4;

  function toggleChannel(key: string) {
    setChannels((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key]));
    setError("");
  }

  function validate(s: number): string {
    if (s === 1 && !agree) return `Please accept the agreement with ${meta.agreementParty}.`;
    if (s === 2) {
      if (product === "dcb") {
        const missing = dcbDocuments.some((d) => !docs[d.key]);
        if (missing) return "Please upload all required documents.";
      } else if (channels.length === 0) {
        return "Select at least one payment channel.";
      }
    }
    return "";
  }

  const data = { agreementAccepted: agree, channels, docs };

  function next() {
    const e = validate(step);
    if (e) {
      setError(e);
      return;
    }
    setError("");
    ob.saveActivation(product, data);
    setStep((s) => Math.min(s + 1, TOTAL - 1));
  }
  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }
  function submit() {
    for (const s of [1, 2]) {
      const e = validate(s);
      if (e) {
        setError(e);
        setStep(s);
        return;
      }
    }
    ob.submitActivation(product, data);
    toast.success(`${meta.short} activation submitted — we'll review it shortly.`);
    router.push("/products");
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl gap-10 px-6 py-10 lg:gap-16 lg:py-12">
      <aside className="hidden w-52 shrink-0 pt-1.5 lg:block">
        <WizardNav
          groups={groups}
          current={step}
          onNavigate={(i) => {
            setError("");
            ob.saveActivation(product, data);
            setStep(i);
          }}
        />
      </aside>

      <div className="w-full max-w-xl">
        {step === 0 && (
          <div>
            <StepHeading
              title={`Activate ${meta.name}`}
              desc={meta.desc}
            />
            <div className="space-y-3">
              {(product === "dcb"
                ? [
                    "Sign the agreement with the telco partner.",
                    "Upload your service description and content compliance documents.",
                    "Submit for review — our team approves per product.",
                  ]
                : [
                    "Sign the agreement with the payment service provider.",
                    "Choose the channels you want to accept (e-wallet, VA, card, QRIS).",
                    "Submit for review — our team approves per product.",
                  ]
              ).map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-3.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-body">{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <StepHeading
              title="Accept the agreement"
              desc={`Review and accept the terms with ${meta.agreementParty} to activate ${meta.short}.`}
            />
            <div className="scroll-slim max-h-56 overflow-y-auto rounded-xl border border-border bg-background/50 p-4 text-sm text-body">
              <p className="font-semibold text-foreground">{meta.short} Service Agreement</p>
              <p className="mt-2">
                By activating {meta.name}, you agree to the operational, settlement, and compliance
                terms set by {meta.agreementParty} and AirPay. You are responsible for the legality of
                the goods and services sold, accurate transaction descriptions, and cooperating with
                risk and dispute reviews. Fees, settlement cycles, and chargeback handling follow the
                schedule provided during activation.
              </p>
              <p className="mt-2">
                This is a sandbox demo — no legal agreement is created. In production, the full
                contract is presented here for signature.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAgree((v) => !v);
                setError("");
              }}
              className={cn(
                "mt-4 flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                agree ? "border-primary bg-primary-50 ring-2 ring-primary/15" : "border-border hover:border-primary/40",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-2",
                  agree ? "border-primary bg-primary text-white" : "border-border bg-card",
                )}
              >
                {agree && <Check size={13} strokeWidth={3} />}
              </span>
              <span className="text-sm font-medium text-foreground">
                I accept the {meta.short} agreement with {meta.agreementParty}.
              </span>
            </button>
          </div>
        )}

        {step === 2 && product === "dcb" && (
          <div>
            <StepHeading
              title="Upload service documents"
              desc="These help the telco partner review what will be billed via DCB."
            />
            <div className="space-y-4">
              {dcbDocuments.map((d) => (
                <DocumentField
                  key={d.key}
                  label={d.label}
                  hint={d.hint}
                  value={docs[d.key]}
                  onChange={(fileName) => {
                    setDocs((prev) => ({ ...prev, [d.key]: fileName ?? "" }));
                    setError("");
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && product === "digital" && (
          <div>
            <StepHeading
              title="Choose payment channels"
              desc="Enable the digital payment methods you want to accept. You can add more later."
            />
            <div className="space-y-2.5">
              {digitalChannels.map((ch) => {
                const active = channels.includes(ch.key);
                return (
                  <button
                    key={ch.key}
                    type="button"
                    onClick={() => toggleChannel(ch.key)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                      active ? "border-primary bg-primary-50 ring-2 ring-primary/15" : "border-border hover:border-primary/40",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-2",
                        active ? "border-primary bg-primary text-white" : "border-border bg-card",
                      )}
                    >
                      {active && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{ch.label}</span>
                      <span className="block text-xs text-muted-foreground">{ch.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <StepHeading
              title="Review & submit"
              desc="Confirm the details. After submitting, our team reviews per product within 1–2 business days."
            />
            <dl className="divide-y divide-border rounded-xl border border-border">
              <div className="flex gap-4 px-4 py-2.5 text-sm">
                <dt className="w-40 shrink-0 text-muted-foreground">Product</dt>
                <dd className="font-medium text-foreground">{meta.name}</dd>
              </div>
              <div className="flex gap-4 px-4 py-2.5 text-sm">
                <dt className="w-40 shrink-0 text-muted-foreground">Country</dt>
                <dd className="font-medium text-foreground">{ob.kyb.country}</dd>
              </div>
              <div className="flex gap-4 px-4 py-2.5 text-sm">
                <dt className="w-40 shrink-0 text-muted-foreground">Agreement</dt>
                <dd className="font-medium text-foreground">{agree ? "Accepted" : "—"}</dd>
              </div>
              <div className="flex gap-4 px-4 py-2.5 text-sm">
                <dt className="w-40 shrink-0 text-muted-foreground">
                  {product === "dcb" ? "Documents" : "Channels"}
                </dt>
                <dd className="font-medium text-foreground">
                  {product === "dcb"
                    ? dcbDocuments.map((d) => docs[d.key] || "—").join(", ")
                    : channels.length
                      ? channels.map((k) => digitalChannels.find((c) => c.key === k)?.label).join(", ")
                      : "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <Button variant="outline" className="rounded-xl" onClick={back}>
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          {step < TOTAL - 1 ? (
            <Button className="flex-1 rounded-xl" onClick={next}>
              {step === 0 ? "Get started" : "Continue"} <ArrowRight size={16} />
            </Button>
          ) : (
            <Button className="flex-1 rounded-xl" onClick={submit}>
              <Send size={16} /> Submit for activation
            </Button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
      <ActivateInner />
    </Suspense>
  );
}
