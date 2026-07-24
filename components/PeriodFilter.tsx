"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const periods = ["This Week", "This Month", "This Quarter", "This Year"] as const;
export type Period = (typeof periods)[number];

/** Compact period dropdown used by the dashboard cards. */
export function PeriodFilter({
  value,
  onChange,
  options = periods,
}: {
  value: string;
  onChange: (v: string) => void;
  options?: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-body">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
