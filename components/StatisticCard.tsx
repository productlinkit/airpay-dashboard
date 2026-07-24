"use client";

import { useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { paymentMethods, methodsTotal } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { PeriodFilter } from "@/components/PeriodFilter";

/** Pick readable text color (dark vs white) for a given hex background. */
function readableText(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#1a1830" : "#ffffff";
}

type Tab = "volume" | "count";

export function StatisticCard() {
  const [tab, setTab] = useState<Tab>("volume");
  const [period, setPeriod] = useState("This Month");

  const centerValue = tab === "volume" ? methodsTotal.volume : methodsTotal.count;
  const centerLabel = tab === "volume" ? "Total volume" : "Transactions";

  return (
    <Card className="gap-0 rounded-2xl p-5 shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Payment methods</h3>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* tabs */}
      <div className="mt-4 flex gap-6 border-b border-border text-sm">
        <button
          onClick={() => setTab("volume")}
          className={`-mb-px border-b-2 pb-2.5 font-medium transition-colors ${
            tab === "volume"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-body"
          }`}
        >
          Volume <span className="text-muted-foreground">({methodsTotal.volume})</span>
        </button>
        <button
          onClick={() => setTab("count")}
          className={`-mb-px border-b-2 pb-2.5 font-medium transition-colors ${
            tab === "count"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-body"
          }`}
        >
          Count <span className="text-muted-foreground">({methodsTotal.count})</span>
        </button>
      </div>

      {/* donut */}
      <div className="relative mx-auto mt-5 h-[168px] w-[168px]">
        <PieChart width={168} height={168}>
          <Pie
            data={paymentMethods}
            dataKey="pct"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={3}
            cornerRadius={6}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {paymentMethods.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
          <span className="text-xl font-bold text-foreground">{centerValue}</span>
        </div>
      </div>

      {/* breakdown list */}
      <div className="mt-5 space-y-3">
        {paymentMethods.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span
              className="grid h-7 w-9 shrink-0 place-items-center rounded-md text-[11px] font-bold"
              style={{ backgroundColor: item.color, color: readableText(item.color) }}
            >
              {item.pct}%
            </span>
            <span className="flex-1 text-sm font-medium text-body">{item.label}</span>
            <span className="text-sm font-semibold text-foreground">
              {tab === "volume" ? item.amount : item.count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
