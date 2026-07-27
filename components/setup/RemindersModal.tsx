"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, BellRing } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultReminders,
  INVOICE_TASKS,
  type ReminderRule,
  type ReminderTiming,
  type RemindersData,
} from "@/lib/setup";

export function RemindersModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ob = useOnboarding();
  const [form, setForm] = useState<RemindersData>(ob.reminders ?? defaultReminders);

  useEffect(() => {
    if (open) setForm(ob.reminders ?? defaultReminders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function updateRule(id: string, patch: Partial<ReminderRule>) {
    setForm((f) => ({ ...f, rules: f.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }
  function removeRule(id: string) {
    setForm((f) => ({ ...f, rules: f.rules.filter((r) => r.id !== id) }));
  }
  function addRule() {
    setForm((f) => ({
      ...f,
      rules: [...f.rules, { id: `r_${Date.now().toString(36)}${f.rules.length}`, days: 7, timing: "before" }],
    }));
  }

  function save() {
    ob.saveReminders(form);
    ob.setTask(INVOICE_TASKS.reminders, true);
    onOpenChange(false);
    toast.success(
      form.enabled ? "Automatic reminders turned on." : "Reminders saved (currently off).",
    );
  }

  const businessName = ob.kyb.legalName?.trim() || "Your business";
  const { brandColor, accentColor } = ob.branding;
  const firstBefore = form.rules.find((r) => r.timing === "before");
  const previewLine = firstBefore
    ? `Your invoice is due in ${firstBefore.days} ${firstBefore.days === 1 ? "day" : "days"}.`
    : "Your invoice payment is due soon.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">Payment reminders</DialogTitle>
          <DialogDescription className="sr-only">
            Schedule automatic emails that remind customers to pay their invoices.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* master toggle */}
          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border p-4">
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Send automatic reminders
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                Email customers about upcoming or overdue invoice payments.
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
          </label>

          {/* schedule */}
          <div className={cn("space-y-3", !form.enabled && "pointer-events-none opacity-50")}>
            <p className="text-sm font-bold text-foreground">Reminder schedule</p>

            {form.rules.length === 0 && (
              <p className="text-sm text-muted-foreground">No reminders yet. Add one below.</p>
            )}

            {form.rules.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-xl border border-border p-2.5">
                <span className="pl-1 text-sm text-body">Email sent</span>
                {r.timing !== "on" && (
                  <>
                    <Input
                      inputMode="numeric"
                      value={String(r.days)}
                      onChange={(e) =>
                        updateRule(r.id, { days: parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0 })
                      }
                      className="h-9 w-14 rounded-lg text-center"
                    />
                    <span className="text-sm text-body">{r.days === 1 ? "day" : "days"}</span>
                  </>
                )}
                <Select value={r.timing} onValueChange={(v) => updateRule(r.id, { timing: v as ReminderTiming })}>
                  <SelectTrigger className="h-9 flex-1 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">before the due date</SelectItem>
                    <SelectItem value="on">on the due date</SelectItem>
                    <SelectItem value="after">after the due date</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={() => removeRule(r.id)}
                  aria-label="Remove reminder"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-background hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              onClick={addRule}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Plus size={15} /> Add a reminder
            </button>
          </div>

          {/* preview */}
          {form.enabled && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
                REMINDER EMAIL PREVIEW
              </p>
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="p-4 text-white" style={{ backgroundColor: brandColor }}>
                  <span className="text-sm font-semibold">{businessName}</span>
                </div>
                <div className="p-4">
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <BellRing size={15} className="text-primary" /> Payment reminder
                  </p>
                  <p className="mt-1 text-sm text-body">{previewLine}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Invoice EXAMPLE-0001 · Rp 10,000,000</p>
                  <button
                    className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Pay invoice
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-xl" onClick={save}>
            Save reminders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
