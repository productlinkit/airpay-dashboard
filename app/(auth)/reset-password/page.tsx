"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, ArrowLeft } from "lucide-react";
import { AuthHeader, PasswordField, SubmitButton } from "@/components/auth/ui";
import { passwordRules } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const passwordOk = passwordRules.every((r) => r.test(password));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordOk) return setError("Your password doesn't meet the requirements yet.");
    if (password !== confirm) return setError("Passwords don't match.");
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 700);
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success">
          <CircleCheck size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-body">
          Your password has been changed. You can now sign in with your new password.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <>
      <AuthHeader
        title="Set a new password"
        subtitle="Choose a strong password you haven't used before."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          label="New password"
          name="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          showPolicy
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm password"
          name="confirm"
          placeholder="Re-enter password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm && password !== confirm ? "Passwords don't match." : undefined}
        />

        {error && <p className="text-xs text-danger">{error}</p>}

        <SubmitButton loading={loading}>Update password</SubmitButton>
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
