"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  Info,
  XCircle,
  RotateCcw,
  Send,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { Stepper } from "@/components/onboarding/Stepper";
import { WizardNav, type WizardGroup } from "@/components/onboarding/WizardNav";
import { DocumentField } from "@/components/onboarding/DocumentField";
import { TextField } from "@/components/auth/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  businessTypes,
  industries,
  countries,
  requiredDocuments,
  statusMeta,
  statusStages,
  stageIndex,
  type KybData,
  type OnbStatus,
  type StatusTone,
} from "@/lib/onboarding";
import { isValidEmail } from "@/lib/auth";

/** Stripe-style left nav: "Verify your business" (4 sub-steps) → "Review and submit". */
const WIZARD_GROUPS: WizardGroup[] = [
  {
    label: "Verify your business",
    steps: ["Business type", "Business details", "Contact & PIC", "Documents"],
  },
  { label: "Review and submit" },
];
const TOTAL_STEPS = 5;

const toneBadge: Record<StatusTone, string> = {
  neutral: "bg-primary-soft text-primary",
  info: "bg-primary-soft text-primary",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

function StatusBadge({ status }: { status: OnbStatus }) {
  const m = statusMeta[status];
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", toneBadge[m.tone])}>
      {m.label}
    </span>
  );
}

/* --------------------------------- SelectField -------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 text-foreground">{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          aria-invalid={!!error}
          className={cn("h-11 w-full rounded-xl", error && "border-destructive")}
        >
          <SelectValue placeholder={placeholder ?? "Select"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* =================================== Page =================================== */

export default function OnboardingPage() {
  const ob = useOnboarding();
  const [editing, setEditing] = useState(false);

  if (!ob.ready) {
    return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  }

  // Step gate: business verification is locked until the email is confirmed.
  if (!ob.emailVerified) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <Card className="items-center gap-0 rounded-2xl p-8 text-center shadow-none">
          <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Mail size={26} />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Verify your email first
          </h1>
          <p className="mt-2 text-sm text-body">
            Confirm your email address from the dashboard before you start business
            verification.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="/">
              <ArrowLeft size={16} /> Back to dashboard
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const showWizard = ob.status === "not_started" || ob.status === "draft" || editing;

  if (showWizard) return <KybWizard onSubmitted={() => setEditing(false)} />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify your business</h1>
        <StatusBadge status={ob.status} />
      </div>
      <StatusView onEdit={() => setEditing(true)} />
    </div>
  );
}

/* ================================= Wizard ================================= */

/** Per-step required-field validation → map of fieldKey → message. */
function validateStep(step: number, form: KybData): Record<string, string> {
  const e: Record<string, string> = {};
  const req = (k: keyof KybData, cond = !!form[k]) => {
    if (!cond) e[k as string] = "This field is required";
  };

  if (step === 0) {
    req("country");
    req("businessType");
  }
  if (step === 1) {
    req("legalName");
    req("taxId");
    req("industry");
    req("addressStreet");
    req("addressCity");
    req("addressProvince");
    req("addressPostal");
  }
  if (step === 2) {
    req("picName");
    req("picRole");
    if (!form.picEmail) e.picEmail = "This field is required";
    else if (!isValidEmail(form.picEmail)) e.picEmail = "Enter a valid email address";
    req("picPhone");
  }
  if (step === 3) {
    requiredDocuments.forEach((d) => {
      if (!form.documents[d.key]) e[d.key] = "Please upload this document";
    });
  }
  return e;
}

function KybWizard({ onSubmitted }: { onSubmitted: () => void }) {
  const ob = useOnboarding();
  // Resume where the user left off when continuing a saved draft.
  const [step, setStep] = useState(() =>
    ob.status === "draft" ? Math.min(Math.max(ob.draftStep, 0), TOTAL_STEPS - 1) : 0,
  );
  const [form, setForm] = useState<KybData>(ob.kyb);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep the latest form/step for the save-on-close (unmount) handler.
  const latest = useRef({ form, step });
  latest.current = { form, step };
  const dirty = useRef(false);

  // Persist progress when the wizard closes (✕ navigates away → unmount).
  useEffect(() => {
    return () => {
      if (dirty.current) ob.saveDraft(latest.current.form, latest.current.step);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof KybData>(key: K, value: KybData[K]) {
    dirty.current = true;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const rest = { ...prev };
      delete rest[key as string];
      return rest;
    });
  }

  function next() {
    const e = validateStep(step, form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    const newStep = Math.min(step + 1, TOTAL_STEPS - 1);
    ob.saveDraft(form, newStep);
    setStep(newStep);
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  /** Backward navigation via the left nav (already-reached steps only). */
  function goto(index: number) {
    setErrors({});
    ob.saveDraft(form, index);
    setStep(index);
  }

  function submit() {
    const all = { ...validateStep(0, form), ...validateStep(1, form), ...validateStep(2, form), ...validateStep(3, form) };
    if (Object.keys(all).length) {
      setErrors(all);
      const firstInvalid = [0, 1, 2, 3].find((s) => Object.keys(validateStep(s, form)).length);
      if (firstInvalid !== undefined) setStep(firstInvalid);
      return;
    }
    ob.submit(form);
    onSubmitted();
  }

  const hasErrors = Object.keys(errors).length > 0;
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="mx-auto flex w-full max-w-5xl gap-10 px-6 py-10 lg:gap-16 lg:py-12">
      <aside className="hidden w-52 shrink-0 pt-1.5 lg:block">
        <WizardNav groups={WIZARD_GROUPS} current={step} onNavigate={goto} />
      </aside>

      <div className="w-full max-w-xl">
        {step === 0 && <BusinessTypeStep form={form} set={set} errors={errors} />}
        {step === 1 && <BusinessDetailsStep form={form} set={set} errors={errors} />}
        {step === 2 && <ContactStep form={form} set={set} errors={errors} />}
        {step === 3 && <DocumentsStep form={form} set={set} errors={errors} />}
        {step === 4 && <ReviewStep form={form} />}

        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <Button variant="outline" className="rounded-xl" onClick={back}>
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          {isLast ? (
            <Button className="flex-1 rounded-xl" onClick={submit}>
              <Send size={16} /> Submit for review
            </Button>
          ) : (
            <Button className="flex-1 rounded-xl" onClick={next}>
              Continue <ArrowRight size={16} />
            </Button>
          )}
        </div>

        {hasErrors && (
          <p className="mt-3 text-sm text-destructive">
            Please fix the highlighted fields to continue.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Wizard steps ------------------------------ */

type StepProps = {
  form: KybData;
  set: <K extends keyof KybData>(key: K, value: KybData[K]) => void;
  errors: Record<string, string>;
};

function StepHeading({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-[15px] text-body">{desc}</p>
    </div>
  );
}

function BusinessTypeStep({ form, set, errors }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Let's start with your business type"
        desc="This helps us set up your account and verification correctly."
      />

      <div className="max-w-sm">
        <SelectField
          label="Business location"
          value={form.country}
          onChange={(v) => set("country", v)}
          options={countries}
          error={errors.country}
        />
      </div>

      <div className="mt-6">
        <Label className="mb-2 text-foreground">Business type</Label>
        <div className="space-y-2.5">
          {businessTypes.map((bt) => {
            const selected = form.businessType === bt.value;
            return (
              <button
                key={bt.value}
                type="button"
                onClick={() => set("businessType", bt.value)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary-50 ring-2 ring-primary/15"
                    : "border-border hover:border-primary/40 hover:bg-background/60",
                )}
              >
                <p className="font-semibold text-foreground">{bt.value}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{bt.desc}</p>
              </button>
            );
          })}
        </div>
        {errors.businessType && (
          <p className="mt-2 text-xs text-destructive">{errors.businessType}</p>
        )}
      </div>
    </div>
  );
}

function BusinessDetailsStep({ form, set, errors }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Tell us about your business"
        desc="Details of the legal entity behind your account."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            label="Legal business name"
            name="legalName"
            placeholder="PT Contoh Sejahtera"
            value={form.legalName}
            onChange={(e) => set("legalName", e.target.value)}
            error={errors.legalName}
          />
        </div>
        <TextField
          label="Tax ID (NPWP)"
          name="taxId"
          placeholder="00.000.000.0-000.000"
          value={form.taxId}
          onChange={(e) => set("taxId", e.target.value)}
          error={errors.taxId}
        />
        <SelectField
          label="Industry"
          value={form.industry}
          onChange={(v) => set("industry", v)}
          options={industries}
          placeholder="Select industry"
          error={errors.industry}
        />
        <div className="sm:col-span-2">
          <TextField
            label="Website (optional)"
            name="website"
            placeholder="https://yourbusiness.com"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 text-foreground">Business description (optional)</Label>
          <Textarea
            placeholder="What does your business sell?"
            className="min-h-20 rounded-xl"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 mt-1">
          <TextField
            label="Business address"
            name="addressStreet"
            placeholder="Street, building, unit"
            value={form.addressStreet}
            onChange={(e) => set("addressStreet", e.target.value)}
            error={errors.addressStreet}
          />
        </div>
        <TextField
          label="City"
          name="addressCity"
          placeholder="Jakarta"
          value={form.addressCity}
          onChange={(e) => set("addressCity", e.target.value)}
          error={errors.addressCity}
        />
        <TextField
          label="Province / State"
          name="addressProvince"
          placeholder="DKI Jakarta"
          value={form.addressProvince}
          onChange={(e) => set("addressProvince", e.target.value)}
          error={errors.addressProvince}
        />
        <TextField
          label="Postal code"
          name="addressPostal"
          placeholder="12345"
          value={form.addressPostal}
          onChange={(e) => set("addressPostal", e.target.value)}
          error={errors.addressPostal}
        />
      </div>
    </div>
  );
}

function ContactStep({ form, set, errors }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Who's the person in charge?"
        desc="Who should we reach for verification and day-to-day operations?"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="PIC full name"
          name="picName"
          placeholder="Badhon Kormokar"
          value={form.picName}
          onChange={(e) => set("picName", e.target.value)}
          error={errors.picName}
        />
        <TextField
          label="PIC role / title"
          name="picRole"
          placeholder="Finance Manager"
          value={form.picRole}
          onChange={(e) => set("picRole", e.target.value)}
          error={errors.picRole}
        />
        <TextField
          label="PIC email"
          name="picEmail"
          type="email"
          placeholder="pic@company.com"
          value={form.picEmail}
          onChange={(e) => set("picEmail", e.target.value)}
          error={errors.picEmail}
        />
        <TextField
          label="PIC phone"
          name="picPhone"
          placeholder="+62 812 3456 7890"
          value={form.picPhone}
          onChange={(e) => set("picPhone", e.target.value)}
          error={errors.picPhone}
        />
      </div>
    </div>
  );
}

function DocumentsStep({ form, set, errors }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Upload your documents"
        desc="Required documents may vary by country. This is the Indonesia baseline (FR-ONB-5)."
      />

      <div className="space-y-4">
        {requiredDocuments.map((doc) => (
          <DocumentField
            key={doc.key}
            label={doc.label}
            hint={doc.hint}
            value={form.documents[doc.key]}
            error={errors[doc.key]}
            onChange={(fileName) =>
              set("documents", { ...form.documents, [doc.key]: fileName ?? "" } as KybData["documents"])
            }
          />
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ form }: { form: KybData }) {
  const rows: [string, string][] = [
    ["Business location", form.country],
    ["Business type", form.businessType],
    ["Legal name", form.legalName],
    ["Tax ID (NPWP)", form.taxId],
    ["Industry", form.industry],
    ["Website", form.website || "—"],
    ["PIC", `${form.picName} · ${form.picRole}`],
    ["PIC email", form.picEmail],
    ["PIC phone", form.picPhone],
    [
      "Address",
      `${form.addressStreet}, ${form.addressCity}, ${form.addressProvince} ${form.addressPostal}`,
    ],
  ];

  return (
    <div>
      <StepHeading
        title="Review and submit"
        desc="Confirm your details. After submitting, our team reviews within 1–2 business days."
      />

      <dl className="divide-y divide-border rounded-xl border border-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-4 px-4 py-2.5 text-sm">
            <dt className="w-40 shrink-0 text-muted-foreground">{k}</dt>
            <dd className="font-medium text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-foreground">Documents</p>
        <div className="space-y-2">
          {requiredDocuments.map((doc) => (
            <div
              key={doc.key}
              className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-sm"
            >
              <span className="text-body">{doc.label}</span>
              <span className="font-medium text-foreground">{form.documents[doc.key] || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =============================== Status view =============================== */

const statusIcon = {
  neutral: Info,
  info: Clock,
  warning: Info,
  success: BadgeCheck,
  danger: XCircle,
} as const;

function StatusView({ onEdit }: { onEdit: () => void }) {
  const ob = useOnboarding();
  const meta = statusMeta[ob.status];
  const Icon = statusIcon[meta.tone];
  const canResubmit = ob.status === "need_more_info" || ob.status === "rejected";

  return (
    <div className="space-y-5">
      <Card className="gap-0 rounded-2xl p-5 shadow-none">
        {ob.status !== "rejected" ? (
          <Stepper steps={statusStages} current={stageIndex(ob.status)} className="mb-6" />
        ) : null}

        <div className="flex items-start gap-4">
          <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", toneBadge[meta.tone])}>
            <Icon size={24} />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{meta.label}</h2>
              <StatusBadge status={ob.status} />
            </div>
            <p className="mt-1 text-sm text-body">{meta.description}</p>
            {ob.reviewNote && (
              <p className="mt-2 rounded-lg bg-background px-3 py-2 text-sm text-foreground">
                <span className="font-semibold">Reviewer note:</span> {ob.reviewNote}
              </p>
            )}
          </div>
        </div>

        {ob.status === "verified" && (
          <div className="mt-5 rounded-xl border border-success/25 bg-success-soft p-4">
            <p className="text-sm font-semibold text-foreground">You&apos;re ready to go live</p>
            <p className="mt-0.5 text-sm text-body">
              Your business is verified. Switch to a live account from the dashboard to start
              accepting real payments.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl">
                <Link href="/">Back to dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {canResubmit && (
          <div className="mt-5">
            <Button className="rounded-xl" onClick={onEdit}>
              <RotateCcw size={16} /> Update details &amp; resubmit
            </Button>
          </div>
        )}
      </Card>

      {/* Status timeline — in-app record of every status change (FR-ONB-9). */}
      {ob.history.length > 0 && (
        <Card className="gap-0 rounded-2xl p-5 shadow-none">
          <h3 className="text-sm font-bold text-foreground">Verification timeline</h3>
          <ol className="mt-4 space-y-4">
            {ob.history.map((h, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn("h-2.5 w-2.5 rounded-full", toneBadge[statusMeta[h.status].tone])} />
                  {i < ob.history.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-foreground">{h.label}</p>
                  {h.note && <p className="text-xs text-body">{h.note}</p>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <AdminDemoPanel />
    </div>
  );
}

/* ----------- Demo admin decision panel (simulates FR-ONB-8 review) ---------- */

function AdminDemoPanel() {
  const ob = useOnboarding();
  const [note, setNote] = useState("");

  return (
    <Card className="gap-0 rounded-2xl border-dashed p-5 shadow-none">
      <p className="text-xs font-semibold text-primary">Demo · admin review action</p>
      <p className="mt-1 text-sm text-body">
        Simulate the internal admin decision to preview each status (FR-ONB-7/8).
      </p>
      <Textarea
        placeholder="Optional reviewer note (shown to the merchant)…"
        className="mt-3 min-h-16 rounded-xl"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="rounded-lg bg-success text-white hover:bg-success/90"
          onClick={() => ob.decide("verified", note || undefined)}
        >
          Approve — Verify
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => ob.decide("need_more_info", note || "Please re-upload a clearer NPWP document.")}
        >
          Request more info
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg border-danger/30 text-danger hover:bg-danger-soft"
          onClick={() => ob.decide("rejected", note || "Business details could not be verified.")}
        >
          Reject
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto rounded-lg" onClick={ob.reset}>
          Reset onboarding
        </Button>
      </div>
    </Card>
  );
}
