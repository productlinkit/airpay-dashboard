"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { passwordRules, passwordStrength } from "@/lib/auth";

const fieldClass = "h-11 rounded-xl";

/* ---------------------------------- Header --------------------------------- */

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: ReactNode;
}) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-1.5 text-sm text-body">{subtitle}</p>
    </div>
  );
}

/* --------------------------------- TextField -------------------------------- */

type FieldProps = ComponentProps<typeof Input> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, id, name, ...props }: FieldProps) {
  const fieldId = id ?? name;
  return (
    <div>
      {label && (
        <Label htmlFor={fieldId} className="mb-1.5 text-foreground">
          {label}
        </Label>
      )}
      <Input
        id={fieldId}
        name={name}
        aria-invalid={!!error}
        className={cn(fieldClass, error && "border-destructive")}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------- PasswordField ------------------------------ */

export function PasswordField({
  label,
  value = "",
  showPolicy = false,
  error,
  id,
  name,
  ...props
}: FieldProps & { showPolicy?: boolean }) {
  const [show, setShow] = useState(false);
  const pw = String(value);
  const strength = passwordStrength(pw);
  const fieldId = id ?? name;

  return (
    <div>
      {label && (
        <Label htmlFor={fieldId} className="mb-1.5 text-foreground">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id={fieldId}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          aria-invalid={!!error}
          className={cn(fieldClass, "pr-11", error && "border-destructive")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-body"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}

      {showPolicy && pw.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: i < strength.score ? strength.color : "#ececf3",
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
          <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {passwordRules.map((rule) => {
              const ok = rule.test(pw);
              return (
                <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                  <span
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded-full",
                      ok ? "bg-success-soft text-success" : "bg-background text-muted-foreground",
                    )}
                  >
                    {ok ? <Check size={11} /> : <X size={11} />}
                  </span>
                  <span className={ok ? "text-body" : "text-muted-foreground"}>
                    {rule.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- SubmitButton ------------------------------- */

export function SubmitButton({
  children,
  loading = false,
  disabled,
  ...props
}: ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button
      type="submit"
      disabled={loading || disabled}
      className="h-11 w-full rounded-xl text-sm font-semibold"
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </Button>
  );
}

/* ------------------------------- GoogleButton ------------------------------- */

export function GoogleButton({
  label = "Continue with Google",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="h-11 w-full rounded-xl text-sm font-semibold"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
        />
      </svg>
      {label}
    </Button>
  );
}

/* --------------------------------- Divider --------------------------------- */

export function OrDivider({ text = "or" }: { text?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{text}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
