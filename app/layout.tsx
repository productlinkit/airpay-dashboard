import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AirPay — Merchant & Partner Platform",
  description: "Accept DCB and digital payments — onboarding, checkout, and reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        <OnboardingProvider>{children}</OnboardingProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
