import { AuthGuard } from "@/components/AuthGuard";

export default function CreateInvoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-card">{children}</div>
    </AuthGuard>
  );
}
