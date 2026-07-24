import { Card } from "@/components/ui/card";
import { CardMenu } from "@/components/CardMenu";

export function PayoutCard() {
  return (
    <Card className="gap-0 rounded-2xl p-5 shadow-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Next payout</h3>
        <CardMenu label="Payout" />
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-foreground">$58,900</span>
        <span className="text-sm text-muted-foreground">scheduled Jul 15, 2026</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-soft">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
            style={{ width: "68%" }}
          />
        </div>
        <span className="text-xs font-semibold text-foreground">Daily</span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">Settlement cycle 68% complete</p>
    </Card>
  );
}
