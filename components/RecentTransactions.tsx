"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { transactions, type TxStatus, type Transaction } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MAX_ROWS = 5;

const statusStyles: Record<TxStatus, string> = {
  Success: "bg-success-soft text-success",
  Pending: "bg-warning-soft text-warning",
  Failed: "bg-danger-soft text-danger",
};

type SortKey = "id" | "method" | "amount" | "channel" | "status";
const columns: { key: SortKey; label: string }[] = [
  { key: "id", label: "Transaction" },
  { key: "method", label: "Method" },
  { key: "amount", label: "Amount" },
  { key: "channel", label: "Channel" },
  { key: "status", label: "Status" },
];

const statusFilters = ["All", "Success", "Pending", "Failed"] as const;

function amountValue(a: string) {
  return parseFloat(a.replace(/[$,]/g, ""));
}

export function RecentTransactions({ className }: { className?: string }) {
  const [status, setStatus] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    let r: Transaction[] = [...transactions];
    if (status !== "All") r = r.filter((t) => t.status === status);
    r.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "amount") cmp = amountValue(a.amount) - amountValue(b.amount);
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return r.slice(0, MAX_ROWS);
  }, [status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <Card className={cn("flex flex-col gap-0 rounded-2xl p-5 shadow-none", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Recent Transactions</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-lg text-xs font-medium text-body">
              <SlidersHorizontal size={14} />
              {status === "All" ? "Filter" : status}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
              {statusFilters.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {s}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => {
                const activeSort = sortKey === col.key;
                return (
                  <TableHead
                    key={col.key}
                    className="text-xs font-medium text-muted-foreground first:pl-0 last:pr-0"
                  >
                    <button
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                        activeSort && "text-foreground",
                      )}
                    >
                      {col.label}
                      {activeSort ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} className="text-muted-foreground/60" />
                      )}
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No transactions match this filter.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-background/60">
                  <TableCell className="py-3.5 pl-0 whitespace-normal">
                    <p className="text-sm font-semibold text-foreground">{tx.id}</p>
                    <p className="max-w-[160px] truncate text-xs text-muted-foreground">
                      {tx.customer}
                    </p>
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-body">{tx.method}</TableCell>
                  <TableCell className="whitespace-nowrap py-3.5 text-sm font-semibold text-foreground">
                    {tx.amount}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-body">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          tx.channel === "Digital" ? "bg-primary" : "bg-ink",
                        )}
                      />
                      {tx.channel}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 pr-0">
                    <Badge
                      className={cn(
                        "rounded-md border-transparent px-2.5 py-1 font-semibold",
                        statusStyles[tx.status],
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <button
        onClick={() => toast.info("Opening all transactions…")}
        className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-semibold text-body transition-colors hover:bg-background"
      >
        View all transactions
      </button>
    </Card>
  );
}
