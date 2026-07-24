// Shared auth helpers for the AirPay dashboard (frontend slice of PRD 5.1).

export type Role = "Merchant" | "Partner" | "Admin Internal" | "Super Admin";

export const roles: Role[] = [
  "Merchant",
  "Partner",
  "Admin Internal",
  "Super Admin",
];

/** FR-AUTH-7: 2FA is mandatory for internal admin roles. */
export function requiresTwoFactor(role: Role): boolean {
  return role === "Admin Internal" || role === "Super Admin";
}

/** FR-AUTH-3: minimum password policy, surfaced live in the UI. */
export type PasswordRule = { label: string; test: (pw: string) => boolean };

export const passwordRules: PasswordRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /\d/.test(pw) },
  { label: "One symbol", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export type Strength = {
  score: number; // 0..5
  label: "Very weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
};

export function passwordStrength(pw: string): Strength {
  const score = passwordRules.reduce((n, r) => n + (r.test(pw) ? 1 : 0), 0);
  const map: Strength["label"][] = [
    "Very weak",
    "Very weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];
  const colors = ["#ef4444", "#ef4444", "#f59e0b", "#eab308", "#84cc16", "#16a34a"];
  return { score, label: map[score], color: colors[score] };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
