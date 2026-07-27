"use client";

import { useEffect, useState } from "react";
import { Globe, MapPin, Tag, Check, ChevronDown, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { popularSellCategories, sellCategoryTree, MANAGE_TASKS } from "@/lib/setup";

type Step = "intro" | "sell";
type SellView = "quick" | "browse";

export function ManagePaymentModal({
  open,
  onOpenChange,
  startStep = "intro",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startStep?: Step;
}) {
  const ob = useOnboarding();

  const [step, setStep] = useState<Step>(startStep);
  const [view, setView] = useState<SellView>("quick");
  const [selected, setSelected] = useState<string>(ob.sellCategory);
  const [expanded, setExpanded] = useState<string | null>("Digital products");
  const [query, setQuery] = useState("");

  // Reset to the requested entry point whenever the modal opens.
  useEffect(() => {
    if (open) {
      setStep(startStep);
      setView(
        startStep === "sell" && ob.sellCategory && !popularSellCategories.includes(ob.sellCategory)
          ? "browse"
          : "quick",
      );
      setSelected(ob.sellCategory);
      setExpanded("Digital products");
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startStep]);

  function saveCategory() {
    if (!selected) return;
    ob.setTask(MANAGE_TASKS.selling, true);
    ob.setSellCategory(selected);
    onOpenChange(false);
    toast.success("Saved — we'll tailor payment methods to what you sell.");
  }

  const filtered =
    query.trim().length > 0
      ? sellCategoryTree
          .flatMap((g) => g.items)
          .filter((i) => i.toLowerCase().includes(query.trim().toLowerCase()))
      : null;

  /* -------------------------------- Intro -------------------------------- */
  if (step === "intro") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {/* illustration */}
          <div className="relative grid h-40 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-dark to-[#4a2fd6]">
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:16px_16px]" />
            <Globe className="text-white/90" size={72} strokeWidth={1.25} />
            <MapPin className="absolute left-10 top-8 text-white/80" size={18} />
            <MapPin className="absolute right-12 top-10 text-white/70" size={16} />
            <MapPin className="absolute bottom-10 left-16 text-white/70" size={16} />
            <span className="absolute bottom-5 right-6 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
              <Tag size={12} className="text-primary" /> Tax handled
            </span>
          </div>

          <DialogHeader className="mt-1">
            <DialogTitle className="text-xl">Set up managed payments</DialogTitle>
            <DialogDescription>
              Accept DCB and digital payments globally with AirPay as your merchant of record. We
              handle tax compliance, fraud, disputes and customer support — so you can focus on
              running your business.{" "}
              <button
                onClick={() => toast.info("Opening documentation (demo).")}
                className="font-semibold text-primary hover:underline"
              >
                Learn more
              </button>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2 sm:justify-between">
            <Button variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Not interested
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => {
                ob.setTask(MANAGE_TASKS.start, true);
                setStep("sell");
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  /* ---------------------------- Tell us what you sell ---------------------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("rounded-2xl", view === "browse" ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle className="text-xl">Tell us what you sell most</DialogTitle>
          <DialogDescription>
            Choose the category that best describes what you sell — you can update it for individual
            products later.
          </DialogDescription>
        </DialogHeader>

        {view === "quick" ? (
          <>
            <div className="space-y-2.5">
              {popularSellCategories.map((c) => {
                const active = selected === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelected(c)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary-50 ring-2 ring-primary/15"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                        active ? "border-primary" : "border-border",
                      )}
                    >
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                    <span className="flex-1 text-foreground">{c}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setView("browse")}
              className="mt-1 text-left text-sm font-semibold text-primary hover:underline"
            >
              Choose something else
            </button>

            <DialogFooter className="mt-2">
              <Button className="rounded-xl" disabled={!selected} onClick={saveCategory}>
                Save
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex gap-4">
              {/* category tree / search results */}
              <div className="scroll-slim max-h-72 w-1/2 overflow-y-auto rounded-xl border border-border p-1.5">
                {filtered ? (
                  filtered.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matches.</p>
                  ) : (
                    filtered.map((item) => (
                      <CategoryLeaf
                        key={item}
                        label={item}
                        active={selected === item}
                        onClick={() => setSelected(item)}
                      />
                    ))
                  )
                ) : (
                  sellCategoryTree.map((g) => {
                    const isOpen = expanded === g.group;
                    return (
                      <div key={g.group}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : g.group)}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-background"
                        >
                          {g.group}
                          <ChevronDown
                            size={15}
                            className={cn("text-muted-foreground transition-transform", isOpen && "rotate-180")}
                          />
                        </button>
                        {isOpen && (
                          <div className="pb-1 pl-1.5">
                            {g.items.map((item) => (
                              <CategoryLeaf
                                key={item}
                                label={item}
                                active={selected === item}
                                onClick={() => setSelected(item)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* helper + search */}
              <div className="w-1/2">
                <p className="text-sm text-body">
                  Select the product tax category that best describes what you sell. More accurate
                  categorization means more accurate tax collected.
                </p>
                <div className="relative mt-3">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by product or tax code"
                    className="h-10 rounded-xl pl-9"
                  />
                </div>
                {selected && (
                  <p className="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-xs text-body">
                    Selected: <span className="font-semibold text-foreground">{selected}</span>
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-2 sm:justify-between">
              <Button variant="ghost" className="rounded-xl" onClick={() => setView("quick")}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button className="rounded-xl" disabled={!selected} onClick={saveCategory}>
                Save
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryLeaf({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
        active ? "bg-primary-soft font-medium text-primary" : "text-body hover:bg-background",
      )}
    >
      <span className="flex-1">{label}</span>
      {active && <Check size={14} className="shrink-0 text-primary" />}
    </button>
  );
}
