"use client";

import { useRef } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";

export function DocumentField({
  label,
  hint,
  value,
  error,
  onChange,
}: {
  label: string;
  hint?: string;
  value?: string;
  error?: string;
  onChange: (fileName: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-soft px-3.5 py-3">
          <FileCheck2 size={20} className="shrink-0 text-success" />
          <span className="flex-1 truncate text-sm font-medium text-foreground">{value}</span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Remove file"
            className="text-muted-foreground hover:text-body"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex w-full items-center gap-3 rounded-xl border border-dashed px-3.5 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary-50 ${
            error ? "border-destructive/60 bg-destructive/5" : "border-border bg-background/60"
          }`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <UploadCloud size={18} />
          </span>
          <span>
            <span className="block text-sm font-medium text-foreground">Click to upload</span>
            {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f.name);
        }}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
