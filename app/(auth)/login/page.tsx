"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthHeader,
  TextField,
  PasswordField,
  SubmitButton,
  GoogleButton,
  OrDivider,
} from "@/components/auth/ui";
import { AccountLinkModal } from "@/components/auth/AccountLinkModal";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { isValidEmail } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useOnboarding();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLink, setShowLink] = useState(false);

  // Everyone lands on the dashboard; email verification + business KYB are completed
  // there as a Stripe-style setup checklist (sandbox until verified).
  const merchantLanding = "/";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setError("");
    setLoading(true);
    signIn(email);

    setTimeout(() => router.push(merchantLanding), 700);
  }

  function handleGoogle() {
    // Simulated: this Google email matches an existing email/password account.
    setShowLink(true);
  }

  return (
    <>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your AirPay merchant dashboard."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Password</span>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary-dark"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            label=""
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <SubmitButton loading={loading}>Sign in</SubmitButton>
      </form>

      <div className="my-5">
        <OrDivider />
      </div>

      <GoogleButton onClick={handleGoogle} />

      <p className="mt-7 text-center text-sm text-body">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:text-primary-dark">
          Sign up
        </Link>
      </p>

      {showLink && (
        <AccountLinkModal
          email={email || "you@company.com"}
          onCancel={() => setShowLink(false)}
          onLink={() => {
            setShowLink(false);
            signIn(email || "you@company.com");
            router.push(merchantLanding);
          }}
        />
      )}
    </>
  );
}
