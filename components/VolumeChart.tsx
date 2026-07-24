"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { volumeByPeriod, volumeTotalByPeriod, type VolumePoint } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { PeriodFilter } from "@/components/PeriodFilter";

type TooltipProps = {
  active?: boolean;
  payload?: { payload: VolumePoint }[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg shadow-ink/5">
      <p className="mb-1.5 text-xs font-semibold text-foreground">{label}</p>
      <div className="flex items-center justify-between gap-6 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-ink" /> Digital
        </span>
        <span className="font-semibold text-foreground">${(d.digital * 1000).toLocaleString()}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-6 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary-light" /> DCB
        </span>
        <span className="font-semibold text-foreground">${(d.dcb * 1000).toLocaleString()}</span>
      </div>
    </div>
  );
}

export function VolumeChart() {
  const [period, setPeriod] = useState("This Year");
  const data = volumeByPeriod[period];

  return (
    <Card className="gap-0 rounded-2xl p-5 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-foreground">Payments volume</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs font-medium text-body">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-ink" /> Digital
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary-light" /> DCB
            </span>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Total processed · {period.toLowerCase()}</p>
        <p className="text-2xl font-bold text-foreground">{volumeTotalByPeriod[period]}</p>
      </div>

      <div className="mt-4 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#ececf3" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9291a5", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9291a5", fontSize: 11 }}
              tickFormatter={(v) => (v === 0 ? "0" : `${v}K`)}
              width={44}
            />
            <Tooltip cursor={{ fill: "rgba(129,105,255,0.06)", radius: 8 }} content={<CustomTooltip />} />
            <Bar dataKey="dcb" stackId="v" fill="#c9beff" barSize={16} />
            <Bar dataKey="digital" stackId="v" fill="#1a1830" barSize={16} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
