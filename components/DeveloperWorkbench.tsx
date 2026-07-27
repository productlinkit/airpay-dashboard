"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SquareTerminal,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
  Check,
  Copy,
  RefreshCw,
  Eye,
  Search,
  Bell,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  apiEndpoints,
  apiEventLogs,
  endpointGroups,
  langLabels,
  type ApiEndpoint,
  type EventTone,
  type Lang,
} from "@/lib/developer";

/** Height of the persistent bottom bar (px). */
const BAR_H = 44;
const MIN_H = 240;
const DEFAULT_H = 560;
/** Space kept clear at the top (sandbox info bar) when maximized. */
const TOP_GAP = 64;

const maxHeight = () =>
  typeof window !== "undefined" ? window.innerHeight - BAR_H - TOP_GAP : 900;

/* ---------------- helpers ---------------- */

const methodBadge = (method: "POST" | "GET") =>
  method === "POST" ? "bg-success-soft text-success" : "bg-primary-soft text-primary";

const eventTone: Record<EventTone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

function toCurl(ep: ApiEndpoint): string {
  const base = ep.path.startsWith("http") ? ep.path : `https://api.airpay.id${ep.path}`;
  const lines = [`curl ${base} \\`, `  -u sk_…:`];
  if (ep.method !== "GET") {
    ep.params
      .filter((p) => p.name !== "idempotency_key" && !p.name.includes("."))
      .forEach((p) => lines.push(`  -d ${p.name}=…`));
  }
  return lines.map((l, i) => (i === lines.length - 1 ? l.replace(/ \\$/, "") : l)).join("\n");
}

/* Lightweight, dependency-free syntax highlighter (Tokyo Night palette). */
const KEYWORDS = new Set([
  "const", "let", "var", "await", "async", "function", "return", "new", "require",
  "import", "from", "export", "def", "echo", "if", "else", "for", "in", "class",
  "public", "private", "use", "true", "false", "null", "None", "True", "False",
]);

function highlight(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re =
    /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  const push = (text: string, cls?: string) =>
    nodes.push(cls ? <span key={k++} className={cls}>{text}</span> : <span key={k++}>{text}</span>);
  const nextNonSpace = (i: number) => {
    while (i < code.length && code[i] === " ") i++;
    return code[i];
  };
  while ((m = re.exec(code))) {
    if (m.index > last) push(code.slice(last, m.index));
    const [full, comment, str, num, word] = m;
    if (comment) push(full, "text-[#6b7394]");
    else if (str) push(full, nextNonSpace(re.lastIndex) === ":" ? "text-[#7dcfff]" : "text-[#9ece6a]");
    else if (num) push(full, "text-[#ff9e64]");
    else if (KEYWORDS.has(word)) push(full, "text-[#bb9af7]");
    else push(full, nextNonSpace(re.lastIndex) === "(" ? "text-[#7aa2f7]" : undefined);
    last = re.lastIndex;
  }
  if (last < code.length) push(code.slice(last));
  return nodes;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group relative overflow-x-auto rounded-xl rounded-tl-none bg-ink p-4">
      <button
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-md bg-white/10 text-white/70 opacity-0 transition hover:bg-white/20 hover:text-white group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
      <pre className="font-mono text-[12.5px] leading-relaxed text-white/90">{highlight(code)}</pre>
    </div>
  );
}

/* ---------------- workbench (bar + resizable drawer) ---------------- */

export function DeveloperWorkbench() {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(DEFAULT_H);
  const [activeKey, setActiveKey] = useState(apiEndpoints[0].key);
  const [lang, setLang] = useState<Lang>("node");
  const [view, setView] = useState<"sdk" | "api">("sdk");
  const draggingRef = useRef(false);

  const onDragMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current) return;
    const next = window.innerHeight - e.clientY - BAR_H;
    setHeight(Math.min(Math.max(next, MIN_H), maxHeight()));
  }, []);

  const onDragEnd = useCallback(() => {
    draggingRef.current = false;
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
  }, [onDragMove]);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onDragMove);
      window.addEventListener("mouseup", onDragEnd);
    },
    [onDragMove, onDragEnd],
  );

  // Clean up listeners if the component unmounts mid-drag.
  useEffect(
    () => () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", onDragEnd);
    },
    [onDragMove, onDragEnd],
  );

  const maxH = maxHeight();
  const panelH = Math.min(height, maxH);
  const isMax = panelH >= maxH - 4;
  const ep = apiEndpoints.find((e) => e.key === activeKey) ?? apiEndpoints[0];

  return (
    <>
      {/* resizable panel (docked above the bar) */}
      {open && (
        <section
          style={{ bottom: BAR_H, height: panelH }}
          className="fixed inset-x-0 z-40 flex flex-col border-t border-border bg-card shadow-[0_-16px_40px_rgba(26,24,48,0.16)]"
        >
          {/* drag handle */}
          <div
            onMouseDown={onDragStart}
            onDoubleClick={() => setHeight(isMax ? DEFAULT_H : maxH)}
            className="group flex h-3 cursor-ns-resize items-center justify-center border-b border-transparent hover:border-border"
            title="Drag to resize"
          >
            <span className="h-1 w-10 rounded-full bg-border transition-colors group-hover:bg-muted-foreground" />
          </div>

          {/* header */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
              <SquareTerminal size={17} />
            </span>
            <h2 className="text-sm font-bold text-foreground">Workbench</h2>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setHeight(isMax ? DEFAULT_H : maxH)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-body"
                aria-label={isMax ? "Restore height" : "Maximize"}
              >
                {isMax ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-body"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* body */}
          <div className="scroll-slim flex-1 space-y-5 overflow-y-auto p-5">
            {/* API reference */}
            <div className="rounded-2xl border border-border bg-background/40 p-5">
              <h3 className="text-lg font-bold text-foreground">
                API reference — DCB &amp; Digital Payment
              </h3>
              <p className="mt-1 text-sm text-body">
                Pick an endpoint, then view the example as an SDK (Node/Python/PHP) or raw API (cURL).
              </p>

              <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
                {/* endpoint picker */}
                <nav className="space-y-4">
                  {endpointGroups.map((group) => (
                    <div key={group}>
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {group}
                      </p>
                      <div className="mt-1.5 space-y-1">
                        {apiEndpoints
                          .filter((e) => e.group === group)
                          .map((e) => {
                            const isActive = e.key === activeKey;
                            return (
                              <button
                                key={e.key}
                                onClick={() => setActiveKey(e.key)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                                  isActive ? "bg-ink text-white" : "hover:bg-background",
                                )}
                              >
                                <span
                                  className={cn(
                                    "rounded px-1.5 py-0.5 text-[10px] font-bold",
                                    isActive ? "bg-white/15 text-white" : methodBadge(e.method),
                                  )}
                                >
                                  {e.method}
                                </span>
                                <span
                                  className={cn(
                                    "font-medium",
                                    isActive ? "text-white" : "text-body",
                                  )}
                                >
                                  {e.label}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* detail */}
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-foreground">{ep.title}</h4>
                  <div className="mt-2 flex items-center gap-2 overflow-x-auto rounded-lg bg-background px-3 py-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-bold",
                        methodBadge(ep.method),
                      )}
                    >
                      {ep.method}
                    </span>
                    <code className="font-mono text-sm text-body">{ep.path}</code>
                  </div>
                  <p className="mt-3 text-sm text-body">{ep.summary}</p>

                  {/* parameters */}
                  <p className="mt-5 text-sm font-bold text-foreground">Parameters</p>
                  <div className="mt-2 divide-y divide-border border-t border-border">
                    {ep.params.map((p) => (
                      <div key={p.name} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                        <div className="sm:w-52 sm:shrink-0">
                          <code className="font-mono text-sm font-semibold text-primary">
                            {p.name}
                          </code>
                          {p.required && (
                            <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                              required
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{p.type}</p>
                          <p className="text-sm text-body">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SDK / API toggle */}
                  <div className="mt-5 flex w-fit rounded-lg bg-background p-0.5">
                    {(["sdk", "api"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                          view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                        )}
                      >
                        {v === "sdk" ? "SDK" : "API (cURL)"}
                      </button>
                    ))}
                  </div>

                  {/* lang tabs (SDK only) */}
                  {view === "sdk" && (
                    <div className="mt-3 flex gap-1">
                      {(Object.keys(langLabels) as Lang[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLang(l)}
                          className={cn(
                            "rounded-t-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                            lang === l
                              ? "bg-ink text-white"
                              : "text-muted-foreground hover:text-body",
                          )}
                        >
                          {langLabels[l]}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={view === "sdk" ? "mt-0" : "mt-3"}>
                    <CodeBlock code={view === "sdk" ? ep.code[lang] : toCurl(ep)} />
                  </div>

                  {/* response */}
                  <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-background/60 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Response · {ep.responseStatus}
                    </p>
                    <pre className="mt-2 font-mono text-[12.5px] leading-relaxed text-body">
                      {ep.response}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* API logs / Event viewer */}
            <div className="rounded-2xl border border-border bg-background/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">API logs / Event viewer</h3>
                  <p className="mt-0.5 text-sm text-body">
                    Debug requests and responses in sandbox &amp; production, with manual replay.
                  </p>
                </div>
                <button
                  onClick={() => toast.success("Event replayed (demo)")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-body transition-colors hover:bg-background"
                >
                  <RefreshCw size={14} /> Replay event
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 text-left font-semibold">Time</th>
                      <th className="pb-2 text-left font-semibold">Event</th>
                      <th className="pb-2 text-left font-semibold">Endpoint</th>
                      <th className="pb-2 text-left font-semibold">Status</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {apiEventLogs.map((log) => (
                      <tr key={log.time} className="text-body">
                        <td className="py-3 font-mono text-[13px] text-muted-foreground">
                          {log.time}
                        </td>
                        <td className="py-3 font-medium text-foreground">{log.event}</td>
                        <td className="py-3 font-mono text-[13px] text-muted-foreground">
                          {log.endpoint}
                        </td>
                        <td className="py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                              eventTone[log.tone],
                            )}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" /> {log.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => toast.info(`${log.event} · ${log.endpoint}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-body transition-colors hover:bg-background"
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* persistent full-width bottom bar (Stripe-style) */}
      <div
        style={{ height: BAR_H }}
        className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-border bg-card px-3"
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            open ? "bg-primary-soft text-primary" : "text-body hover:bg-background",
          )}
        >
          <SquareTerminal size={17} />
          Developers
          <ChevronUp
            size={14}
            className={cn(
              "transition-transform",
              open ? "text-primary" : "rotate-180 text-muted-foreground",
            )}
          />
        </button>

        <div className="ml-auto flex items-center gap-0.5 text-muted-foreground">
          <button
            onClick={() => setOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-background hover:text-body"
            aria-label="Search logs"
            title="Search"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => setOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-background hover:text-body"
            aria-label="Alerts"
            title="Alerts"
          >
            <Bell size={16} />
          </button>
          <button
            onClick={() => setOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-background hover:text-body"
            aria-label="Activity"
            title="Activity"
          >
            <Activity size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
