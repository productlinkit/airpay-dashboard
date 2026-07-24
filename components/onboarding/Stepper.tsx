import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal step indicator. `current` is the active step index;
 * steps before it are completed, after it are upcoming.
 */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: readonly string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                  done && "bg-primary text-white",
                  active && "bg-primary text-white ring-4 ring-primary/15",
                  !done && !active && "bg-primary-soft text-muted-foreground",
                )}
              >
                {done ? <Check size={15} /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-3 h-px flex-1 transition-colors",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
