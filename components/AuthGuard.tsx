"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

/**
 * Gates the dashboard: unauthenticated visitors are sent to /login, so the app's
 * entry point is always the login page. Renders nothing until auth is confirmed
 * to avoid flashing the dashboard before the redirect.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, authed } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authed) router.replace("/login");
  }, [ready, authed, router]);

  if (!ready || !authed) return null;
  return <>{children}</>;
}
