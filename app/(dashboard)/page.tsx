import { BalanceCard } from "@/components/BalanceCard";
import { QuickActions } from "@/components/QuickActions";
import { PayoutCard } from "@/components/PayoutCard";
import { ProductsCard } from "@/components/ProductsCard";
import { DisputesCard } from "@/components/DisputesCard";
import { StatCards } from "@/components/StatCards";
import { VolumeChart } from "@/components/VolumeChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { StatisticCard } from "@/components/StatisticCard";
import { RecentActivity } from "@/components/RecentActivity";

export default function DashboardPage() {
  return (
    <>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Left column */}
        <div className="flex flex-col gap-5 xl:col-span-3">
          <BalanceCard />
          <QuickActions />
          <PayoutCard />
          <ProductsCard />
          <DisputesCard className="flex-1" />
        </div>

        {/* Center column */}
        <div className="flex flex-col gap-5 xl:col-span-6">
          <StatCards />
          <VolumeChart />
          <RecentTransactions className="flex-1" />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 xl:col-span-3">
          <StatisticCard />
          <RecentActivity className="flex-1" />
        </div>
      </div>
    </>
  );
}
