"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Signal,
  Wallet,
  ArrowRight,
  ShieldAlert,
  BadgeCheck,
  Clock,
  XCircle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  productKeys,
  productMeta,
  actStatusMeta,
  digitalChannels,
  isProductAvailable,
  type ProductKey,
  type ActTone,
} from "@/lib/activation";

const toneBadge: Record<ActTone, string> = {
  neutral: "bg-primary-soft text-primary",
  info: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

const productIcon: Record<ProductKey, LucideIcon> = { dcb: Signal, digital: Wallet };

export default function ProductsPage() {
  const ob = useOnboarding();

  if (!ob.ready) {
    return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  }

  const verified = ob.status === "verified";

  return (
    <div className="mx-auto max-w-4xl py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
        <p className="mt-1 text-sm text-body">
          Activate DCB and Digital Payment independently, whenever you need them. Activation is
          separate from onboarding.
        </p>
      </div>

      {!verified && (
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary-50 p-4 sm:flex-row sm:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <ShieldAlert size={22} />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Verify your business to activate products</p>
            <p className="mt-0.5 text-sm text-body">
              You can explore in sandbox now. Product activation goes live after your business is
              verified.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-xl">
            <Link href="/onboarding">
              Verify business <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {productKeys.map((key) => (
          <ProductCard key={key} product={key} verified={verified} />
        ))}
      </div>

      <AdminDemoPanel />
    </div>
  );
}

function ProductCard({ product, verified }: { product: ProductKey; verified: boolean }) {
  const ob = useOnboarding();
  const meta = productMeta[product];
  const act = ob.activations[product];
  const Icon = productIcon[product];
  const statusMeta = actStatusMeta[act.status];
  const available = isProductAvailable(product, ob.kyb.country);

  const cta =
    act.status === "not_activated"
      ? { label: "Activate", href: `/activate?product=${product}` }
      : act.status === "in_progress"
        ? { label: "Continue activation", href: `/activate?product=${product}` }
        : act.status === "rejected"
          ? { label: "Review & resubmit", href: `/activate?product=${product}` }
          : null;

  return (
    <Card className="flex flex-col gap-0 rounded-2xl p-5 shadow-none">
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon size={22} />
        </span>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", toneBadge[statusMeta.tone])}>
          {statusMeta.label}
        </span>
      </div>

      <h3 className="mt-3 font-bold text-foreground">{meta.name}</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{meta.desc}</p>

      {/* live: enabled channels */}
      {act.status === "live" && product === "digital" && act.channels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {act.channels.map((k) => (
            <span key={k} className="rounded-md bg-background px-2 py-0.5 text-xs font-medium text-body">
              {digitalChannels.find((c) => c.key === k)?.label ?? k}
            </span>
          ))}
        </div>
      )}

      {/* next action / status note (FR-ACT-9) */}
      <p className="mt-3 flex-1 text-sm text-body">
        {act.status === "rejected" && act.reviewNote ? (
          <span className="text-danger">Reviewer note: {act.reviewNote}</span>
        ) : (
          statusMeta.description
        )}
      </p>

      <div className="mt-4">
        {!available ? (
          <p className="text-xs font-medium text-muted-foreground">
            Not available in {ob.kyb.country}.
          </p>
        ) : act.status === "in_review" ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-sm font-semibold text-primary">
            <Clock size={15} /> In review
          </span>
        ) : act.status === "live" ? (
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => toast.info("Production credentials are in Developers (coming soon).")}
          >
            Manage
          </Button>
        ) : cta ? (
          <Button asChild className="rounded-xl" disabled={!verified}>
            {verified ? (
              <Link href={cta.href}>
                {cta.label} <ArrowRight size={16} />
              </Link>
            ) : (
              <span>
                {cta.label} <ArrowRight size={16} />
              </span>
            )}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

/* ---------- Demo admin decision panel (simulates FR-ACT-4 review) ---------- */

const statusIcon = { info: Clock, success: BadgeCheck, danger: XCircle, neutral: Info } as const;

function AdminDemoPanel() {
  const ob = useOnboarding();
  const [note, setNote] = useState("");

  const pending = productKeys.filter((k) => ob.activations[k].status === "in_review");
  if (pending.length === 0) return null;

  return (
    <Card className="mt-6 gap-0 rounded-2xl border-dashed p-5 shadow-none">
      <p className="text-xs font-semibold text-primary">Demo · admin activation review</p>
      <p className="mt-1 text-sm text-body">
        Simulate the internal admin decision to preview each per-product status (FR-ACT-4/5).
      </p>
      <Textarea
        placeholder="Optional reviewer note (shown to the merchant)…"
        className="mt-3 min-h-16 rounded-xl"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-3 space-y-2">
        {pending.map((k) => {
          const Icon = statusIcon.info;
          return (
            <div key={k} className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-3">
              <Icon size={16} className="text-primary" />
              <span className="flex-1 text-sm font-medium text-foreground">
                {productMeta[k].name} — in review
              </span>
              <Button
                size="sm"
                className="rounded-lg bg-success text-white hover:bg-success/90"
                onClick={() => {
                  ob.decideActivation(k, "live", note || undefined);
                  toast.success(`${productMeta[k].short} is now live.`);
                  setNote("");
                }}
              >
                Approve — go live
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-danger/30 text-danger hover:bg-danger-soft"
                onClick={() => {
                  ob.decideActivation(k, "rejected", note || "Requirements incomplete — please resubmit.");
                  toast.info(`${productMeta[k].short} activation rejected.`);
                  setNote("");
                }}
              >
                Reject
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
