import Link from "next/link";
import { X } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <header className="flex items-center gap-4 border-b border-border px-5 py-3.5 lg:px-6">
        <Link
          href="/"
          aria-label="Close and return to dashboard"
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <X size={18} />
        </Link>
        <span className="h-5 w-px bg-border" />
        <span className="text-sm font-semibold text-foreground">Verify your business</span>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
