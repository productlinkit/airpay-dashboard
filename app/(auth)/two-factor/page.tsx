"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";

const LENGTH = 6;

function TwoFactorInner() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") || "Admin Internal";

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const code = digits.join("");

  function setAt(i: number, val: string) {
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError("");
  }

  function handleChange(i: number, raw: string) {
    const val = raw.replace(/\D/g, "");
    if (!val) return setAt(i, "");
    // support pasting the full code into one box
    if (val.length > 1) {
      const chars = val.slice(0, LENGTH).split("");
      const next = Array(LENGTH).fill("");
      chars.forEach((c, idx) => (next[idx] = c));
      setDigits(next);
      inputs.current[Math.min(chars.length, LENGTH - 1)]?.focus();
      return;
    }
    setAt(i, val);
    if (i < LENGTH - 1) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < LENGTH) return setError("Enter the 6-digit code.");
    setLoading(true);
    setTimeout(() => router.push("/"), 700);
  }

  return (
    <div>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <ShieldCheck size={26} />
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Two-factor authentication
        </h1>
        <p className="mt-2 text-sm text-body">
          2FA is required for{" "}
          <span className="font-semibold text-foreground">{role}</span> accounts. Enter
          the 6-digit code from your authenticator app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7">
        <div className="flex justify-center gap-2.5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-13 w-12 rounded-xl border bg-card text-center text-xl font-bold text-foreground outline-none transition-all focus:ring-2 ${
                error
                  ? "border-danger/50 focus:ring-danger/10"
                  : "border-border focus:border-primary/50 focus:ring-primary/10"
              }`}
            />
          ))}
        </div>

        {error && <p className="mt-3 text-center text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify & sign in"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setCooldown(30)}
          disabled={cooldown > 0}
          className="text-sm font-medium text-body transition-colors hover:text-foreground disabled:opacity-60"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>

      <div className="mt-8 border-t border-border pt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-body"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <TwoFactorInner />
    </Suspense>
  );
}
