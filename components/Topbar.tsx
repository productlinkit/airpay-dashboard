"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageSquare, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  { title: "Payout completed", detail: "IDR 58,900,000 sent to BCA ****4021", time: "16:05" },
  { title: "New dispute", detail: "Opened on order TRX-8790", time: "13:05" },
  { title: "QRIS channel live", detail: "Digital Payment now accepts QRIS", time: "02:05" },
];

export function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <header className="flex items-center gap-4 px-5 py-4 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <Logo withText={false} />
        </div>
        <h1 className="text-xl font-bold text-foreground lg:text-[22px]">Dashboard</h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search transactions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                toast.info(`Searching for “${query.trim()}”…`);
              }
            }}
            className="h-10 w-44 rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-body outline-none transition-all placeholder:text-muted-foreground focus:w-60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 md:w-56"
          />
        </div>

        <button
          onClick={() => toast.info("No new messages")}
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-body transition-colors hover:text-primary"
        >
          <MessageSquare size={18} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-body outline-none transition-colors hover:text-primary data-[state=open]:text-primary">
            <Bell size={18} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 rounded-xl">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <button
                onClick={() => toast.success("All notifications marked as read")}
                className="text-xs font-medium text-primary hover:text-primary-dark"
              >
                Mark all read
              </button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5">
                <span className="text-sm font-semibold text-foreground">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.detail}</span>
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-3 outline-none transition-colors hover:border-primary/30 data-[state=open]:border-primary/30">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-xs font-bold text-white">
                BK
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-semibold text-foreground sm:block">
              Badhon Kormokar
            </span>
            <ChevronDown size={15} className="hidden text-muted-foreground sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold text-foreground">Badhon Kormokar</p>
              <p className="text-xs text-muted-foreground">productlinkit@gmail.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Opening profile…")}>
              <User size={16} /> My profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Opening account & security…")}>
              <Settings size={16} /> Account &amp; security
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => router.push("/login")}>
              <LogOut size={16} /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
