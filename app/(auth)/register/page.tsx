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
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { isValidEmail, passwordRules } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { startAccount } = useOnboarding();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordOk = passwordRules.every((r) => r.test(password));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter your full name.");
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    if (!passwordOk) return setError("Your password doesn't meet the requirements yet.");
    if (!agree) return setError("Please accept the terms to continue.");
    setError("");
    setLoading(true);

    // New concept (Stripe-style): go straight into the dashboard in sandbox mode.
    // Email verification happens there via a first-time modal, then business KYB.
    setTimeout(() => {
      startAccount(email);
      router.push("/");
    }, 700);
  }

  return (
    <>
      <AuthHeader
        title="Create your account"
        subtitle="One account for DCB and digital payments. No product choice yet — activate later from the dashboard."
      />

      <GoogleButton
        label="Sign up with Google"
        onClick={() => {
          startAccount(email || "you@company.com");
          router.push("/");
        }}
      />

      <div className="my-5">
        <OrDivider />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Full name"
          name="name"
          placeholder="Badhon Kormokar"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Work email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label="Password"
          name="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          showPolicy
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="flex items-start gap-2.5 text-sm text-body">
          <Checkbox
            checked={agree}
            onCheckedChange={(v) => setAgree(v === true)}
            className="mt-0.5"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="font-semibold text-primary hover:text-primary-dark">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="font-semibold text-primary hover:text-primary-dark">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>

      <p className="mt-7 text-center text-sm text-body">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </>
  );
}
