"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";
import { AuthHeader, TextField, SubmitButton } from "@/components/auth/ui";
import { isValidEmail } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <MailCheck size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-body">
          If an email/password account exists for{" "}
          <span className="font-semibold text-foreground">{email}</span>, we&apos;ve
          sent a link to reset your password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your account email and we'll send you a reset link. Available for email/password accounts."
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
          error={error}
        />
        <SubmitButton loading={loading}>Send reset link</SubmitButton>
      </form>

      <div className="mt-7 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-body"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </div>
    </>
  );
}
