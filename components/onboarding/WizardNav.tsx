"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type WizardGroup = { label: string; steps?: string[] };

type StepState = "done" | "active" | "upcoming";

/** Big circle marker for a top-level group. */
function GroupMarker({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return <span className="h-5 w-5 rounded-full border-[3px] border-primary bg-card" />;
  }
  return <span className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/40 bg-card" />;
}

/** Small marker for a sub-step. */
function SubMarker({ state }: { state: StepState }) {
  if (state === "done") return <span className="h-2.5 w-2.5 rounded-full bg-primary" />;
  if (state === "active") return <span className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-card" />;
  return <span className="h-2.5 w-2.5 rounded-full bg-border" />;
}

export function WizardNav({
  groups,
  current,
  onNavigate,
}: {
  groups: WizardGroup[];
  current: number;
  /** Jump to a previously reached step. */
  onNavigate?: (index: number) => void;
}) {
  // Assign a flat index to every leaf/sub-step in order.
  let idx = 0;
  const nodes = groups.map((g) => {
    if (g.steps?.length) {
      const items = g.steps.map((label) => ({ label, index: idx++ }));
      return { type: "group" as const, label: g.label, items };
    }
    return { type: "leaf" as const, label: g.label, index: idx++ };
  });

  const stateOf = (index: number): StepState =>
    current === index ? "active" : current > index ? "done" : "upcoming";

  return (
    <nav className="space-y-3">
      {nodes.map((node, gi) => {
        if (node.type === "leaf") {
          const s = stateOf(node.index);
          return (
            <button
              key={gi}
              onClick={() => onNavigate && current > node.index && onNavigate(node.index)}
              disabled={!(onNavigate && current > node.index)}
              className={cn(
                "flex items-center gap-3 text-left",
                onNavigate && current > node.index ? "cursor-pointer" : "cursor-default",
              )}
            >
              <GroupMarker state={s} />
              <span
                className={cn(
                  "text-sm font-semibold",
                  s === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {node.label}
              </span>
            </button>
          );
        }

        const first = node.items[0].index;
        const last = node.items[node.items.length - 1].index;
        const gState: StepState = current > last ? "done" : current >= first ? "active" : "upcoming";

        return (
          <div key={gi}>
            <div className="flex items-center gap-3">
              <GroupMarker state={gState} />
              <span
                className={cn(
                  "text-sm font-semibold",
                  gState === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {node.label}
              </span>
            </div>

            <ol className="ml-[9px] mt-1 space-y-1 border-l border-border pl-[19px]">
              {node.items.map((it) => {
                const s = stateOf(it.index);
                const canJump = !!onNavigate && current > it.index;
                return (
                  <li key={it.index}>
                    <button
                      onClick={() => canJump && onNavigate!(it.index)}
                      disabled={!canJump}
                      className={cn(
                        "flex w-full items-center gap-2.5 py-1 text-left",
                        canJump ? "cursor-pointer" : "cursor-default",
                      )}
                    >
                      <SubMarker state={s} />
                      <span
                        className={cn(
                          "text-sm",
                          s === "active"
                            ? "font-semibold text-primary"
                            : s === "done"
                              ? "font-medium text-foreground"
                              : "text-muted-foreground",
                        )}
                      >
                        {it.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </nav>
  );
}
