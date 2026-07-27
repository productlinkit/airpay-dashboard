import { SocialLinks } from "@/components/SocialLinks";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { SandboxBar } from "@/components/SandboxBar";
import { SetupGuide } from "@/components/SetupGuide";
import { AuthGuard } from "@/components/AuthGuard";
import { DeveloperWorkbench } from "@/components/DeveloperWorkbench";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background">
      <SandboxBar />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 px-5 pb-16 lg:px-8">
            {children}

            <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span>Copyright © 2025 AirPay</span>
                <a href="#" className="hover:text-body">Privacy Policy</a>
                <a href="#" className="hover:text-body">Term and conditions</a>
                <a href="#" className="hover:text-body">Contact</a>
              </div>
              <SocialLinks />
            </footer>
          </main>
        </div>
      </div>

        {/* Floating Stripe-style setup checklist */}
        <SetupGuide />

        {/* Developers workbench — full-width fixed bottom bar + resizable panel */}
        <DeveloperWorkbench />
      </div>
    </AuthGuard>
  );
}
