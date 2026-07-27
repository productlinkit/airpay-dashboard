"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { TextField } from "@/components/auth/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { countries } from "@/lib/onboarding";
import { isValidEmail } from "@/lib/auth";
import { INVOICE_TASKS, type CustomerItem } from "@/lib/setup";

const empty = {
  name: "",
  email: "",
  phone: "",
  description: "",
  country: "Indonesia",
  line1: "",
  city: "",
  state: "",
  postal: "",
};

export function CreateCustomerModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the new customer after it's added (e.g. to auto-select it). */
  onCreated?: (customer: CustomerItem) => void;
}) {
  const ob = useOnboarding();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (open) {
      setForm(empty);
      setErrors({});
    }
  }, [open]);

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name" || key === "email") setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function save() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Enter the customer's name.";
    if (!form.email.trim()) e.email = "Enter an email address.";
    else if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const customer: CustomerItem = {
      id: `cus_${Date.now().toString(36)}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      description: form.description.trim() || undefined,
      country: form.country,
      line1: form.line1.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      postal: form.postal.trim() || undefined,
    };
    ob.addCustomer(customer);
    ob.setTask(INVOICE_TASKS.customer, true);
    onCreated?.(customer);
    onOpenChange(false);
    toast.success(`“${customer.name}” added to your customers.`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">Create a customer</DialogTitle>
          <DialogDescription className="sr-only">
            Add a customer to bill with invoices and subscriptions.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <p className="text-sm font-bold text-foreground">Customer details</p>
            <TextField
              label="Name"
              name="name"
              placeholder="Andi Wijaya"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              placeholder="andi@company.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
            />
            <TextField
              label="Phone (optional)"
              name="phone"
              placeholder="+62 812 3456 7890"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <div>
              <Label className="mb-1.5 text-foreground">Description (optional)</Label>
              <Textarea
                placeholder="Internal note about this customer."
                className="min-h-16 rounded-xl"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            <p className="text-sm font-bold text-foreground">Billing address (optional)</p>
            <div>
              <Label className="mb-1.5 text-foreground">Country</Label>
              <Select value={form.country} onValueChange={(v) => set("country", v)}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TextField
              label="Address line"
              name="line1"
              placeholder="Street, building, unit"
              value={form.line1}
              onChange={(e) => set("line1", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="City"
                name="city"
                placeholder="Jakarta"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
              <TextField
                label="State / Province"
                name="state"
                placeholder="DKI Jakarta"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
              <TextField
                label="Postal code"
                name="postal"
                placeholder="12345"
                value={form.postal}
                onChange={(e) => set("postal", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className={cn("gap-3 border-t border-border px-6 py-4")}>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-xl" onClick={save}>
            Add customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
