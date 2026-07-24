"use client";

import { MoreHorizontal, RefreshCw, Download, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Reusable "…" card menu with dummy actions that give real feedback. */
export function CardMenu({ label = "card" }: { label?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Card menu"
        className="text-muted-foreground outline-none transition-colors hover:text-body"
      >
        <MoreHorizontal size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        <DropdownMenuItem onClick={() => toast.success(`${label} refreshed`)}>
          <RefreshCw size={15} /> Refresh
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success(`${label} exported as CSV`)}>
          <Download size={15} /> Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast(`${label} hidden`)}>
          <EyeOff size={15} /> Hide widget
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
