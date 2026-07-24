"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { activities, type Activity } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { CardMenu } from "@/components/CardMenu";

const avatarColors = ["#8169ff", "#a594ff", "#1a1830", "#6b4ff0", "#c9beff"];

function groupByDay(items: Activity[]) {
  return items.reduce<Record<string, Activity[]>>((acc, item) => {
    (acc[item.day] ??= []).push(item);
    return acc;
  }, {});
}

export function RecentActivity({ className }: { className?: string }) {
  const grouped = groupByDay(activities);
  let colorIndex = 0;

  return (
    <Card className={cn("flex flex-col gap-0 rounded-2xl p-5 shadow-none", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
        <CardMenu label="Activity" />
      </div>

      <div className="mt-4 flex-1 space-y-5">
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day}>
            <p className="mb-3 text-xs font-semibold text-muted-foreground">{day}</p>
            <div className="space-y-4">
              {items.map((item) => {
                const bg = avatarColors[colorIndex++ % avatarColors.length];
                return (
                  <div key={item.name + item.time} className="flex items-start gap-3">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: bg,
                        color: bg === "#c9beff" ? "#1a1830" : "#ffffff",
                      }}
                    >
                      {item.avatar}
                    </span>
                    <div className="flex-1 leading-snug">
                      <p className="text-sm text-body">
                        <span className="font-semibold text-foreground">{item.name}</span>{" "}
                        {item.action}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => toast.info("Opening activity log…")}
        className="mt-5 w-full rounded-xl border border-border py-2.5 text-sm font-semibold text-body transition-colors hover:bg-background"
      >
        View all activity
      </button>
    </Card>
  );
}
