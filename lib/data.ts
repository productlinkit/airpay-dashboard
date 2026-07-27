import {
  LayoutGrid,
  ArrowLeftRight,
  CreditCard,
  Scale,
  Wallet,
  Repeat,
  Blocks,
  LayoutTemplate,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  badge?: string;
  hasChildren?: boolean;
};

/** AirPay merchant navigation, mapped to PRD Section 5 feature areas. */
export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "Checkout", icon: CreditCard },
  { label: "Disputes", icon: Scale, badge: "3" },
  { label: "Settlements", icon: Wallet },
  { label: "Subscriptions", icon: Repeat },
  { label: "Products", icon: Blocks },
  { label: "Landing Pages", icon: LayoutTemplate },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

/** Overview KPIs (PRD Section 8 metrics). */
export const stats = [
  { label: "Total Volume", value: "$1,284,900", delta: "+18.2%", trend: "up" as const },
  { label: "Success Rate", value: "97.4%", delta: "+0.6%", trend: "up" as const },
  { label: "Net Settled", value: "$1,102,340", delta: "+15.4%", trend: "up" as const },
];

/** Product activation status (PRD 5.3 — DCB & Digital Payment). */
export type ProductStatus = "Live" | "In review" | "Not activated";
export const products: {
  name: string;
  desc: string;
  status: ProductStatus;
  icon: "wallet" | "smartphone";
}[] = [
  { name: "Digital Payment", desc: "e-wallet · VA · card · QRIS", status: "Live", icon: "wallet" },
  { name: "DCB", desc: "Direct Carrier Billing", status: "In review", icon: "smartphone" },
];

/** Processed volume by channel, in thousands (DCB vs Digital), per period. */
export type VolumePoint = { month: string; digital: number; dcb: number };
export const volumeByPeriod: Record<string, VolumePoint[]> = {
  "This Week": [
    { month: "Mon", digital: 11, dcb: 4 },
    { month: "Tue", digital: 14, dcb: 5 },
    { month: "Wed", digital: 9, dcb: 3 },
    { month: "Thu", digital: 16, dcb: 6 },
    { month: "Fri", digital: 18, dcb: 7 },
    { month: "Sat", digital: 13, dcb: 5 },
    { month: "Sun", digital: 10, dcb: 4 },
  ],
  "This Month": [
    { month: "W1", digital: 58, dcb: 22 },
    { month: "W2", digital: 66, dcb: 25 },
    { month: "W3", digital: 74, dcb: 28 },
    { month: "W4", digital: 69, dcb: 26 },
  ],
  "This Quarter": [
    { month: "Apr", digital: 84, dcb: 30 },
    { month: "May", digital: 66, dcb: 26 },
    { month: "Jun", digital: 78, dcb: 29 },
  ],
  "This Year": [
    { month: "Jan", digital: 62, dcb: 24 },
    { month: "Feb", digital: 55, dcb: 21 },
    { month: "Mar", digital: 70, dcb: 27 },
    { month: "Apr", digital: 84, dcb: 30 },
    { month: "May", digital: 66, dcb: 26 },
    { month: "Jun", digital: 78, dcb: 29 },
    { month: "Jul", digital: 58, dcb: 22 },
    { month: "Aug", digital: 88, dcb: 33 },
    { month: "Sep", digital: 95, dcb: 31 },
    { month: "Oct", digital: 72, dcb: 28 },
    { month: "Nov", digital: 61, dcb: 24 },
    { month: "Dec", digital: 90, dcb: 34 },
  ],
};
export const volumeTotalByPeriod: Record<string, string> = {
  "This Week": "$284,900",
  "This Month": "$566,100",
  "This Quarter": "$1,024,300",
  "This Year": "$1,284,900",
};

/** Payment method mix (donut) — volume share + transaction counts. */
export const paymentMethods = [
  { label: "E-wallet", pct: 38, amount: "$488,262", count: "3,398", color: "#8169ff" },
  { label: "Virtual Account", pct: 24, amount: "$308,376", count: "2,146", color: "#a594ff" },
  { label: "QRIS", pct: 18, amount: "$231,282", count: "1,609", color: "#c9beff" },
  { label: "Card", pct: 12, amount: "$154,188", count: "1,073", color: "#1a1830" },
  { label: "DCB", pct: 8, amount: "$102,792", count: "716", color: "#dcd7f5" },
];
export const methodsTotal = { volume: "$1.28M", count: "8,942" };

export type TxStatus = "Success" | "Pending" | "Failed";
export type Channel = "Digital" | "DCB";
export type Transaction = {
  id: string;
  customer: string;
  method: string;
  channel: Channel;
  date: string;
  time: string;
  amount: string;
  status: TxStatus;
};

export const transactions: Transaction[] = [
  {
    id: "TRX-8842",
    customer: "andi.wijaya@gmail.com",
    method: "E-wallet",
    channel: "Digital",
    date: "2026-07-13",
    time: "09:24:11",
    amount: "$182.50",
    status: "Success",
  },
  {
    id: "TRX-8841",
    customer: "0812-3456-7890",
    method: "DCB",
    channel: "DCB",
    date: "2026-07-13",
    time: "09:12:03",
    amount: "$4.99",
    status: "Pending",
  },
  {
    id: "TRX-8840",
    customer: "siti.rahma@outlook.com",
    method: "Virtual Account",
    channel: "Digital",
    date: "2026-07-13",
    time: "08:57:40",
    amount: "$326.00",
    status: "Success",
  },
  {
    id: "TRX-8839",
    customer: "budi.santoso@gmail.com",
    method: "Card",
    channel: "Digital",
    date: "2026-07-12",
    time: "22:41:18",
    amount: "$95.20",
    status: "Failed",
  },
  {
    id: "TRX-8838",
    customer: "dewi.lestari@gmail.com",
    method: "QRIS",
    channel: "Digital",
    date: "2026-07-12",
    time: "20:15:52",
    amount: "$58.75",
    status: "Success",
  },
  {
    id: "TRX-8837",
    customer: "0813-9988-1122",
    method: "DCB",
    channel: "DCB",
    date: "2026-07-12",
    time: "18:03:27",
    amount: "$2.49",
    status: "Success",
  },
  {
    id: "TRX-8836",
    customer: "rian.pratama@gmail.com",
    method: "Card",
    channel: "Digital",
    date: "2026-07-12",
    time: "15:47:09",
    amount: "$412.00",
    status: "Pending",
  },
  {
    id: "TRX-8835",
    customer: "maya.putri@outlook.com",
    method: "E-wallet",
    channel: "Digital",
    date: "2026-07-11",
    time: "11:22:40",
    amount: "$74.30",
    status: "Success",
  },
];

export type Activity = {
  name: string;
  action: string;
  time: string;
  day: "Today" | "Yesterday";
  avatar: string;
};

/** Dispute overview (PRD 5.10 — FR-DIS-5/7). */
export type DisputeStatus = "Needs response" | "Under review" | "Won" | "Lost";
export const disputeSummary = {
  winRate: "82%",
  winRateDelta: "+4%",
  open: 3,
  needsResponse: 1,
};
export const disputes: { id: string; reason: string; amount: string; status: DisputeStatus }[] = [
  { id: "TRX-8790", reason: "Product not received", amount: "$120.00", status: "Needs response" },
  { id: "TRX-8712", reason: "Unrecognized charge", amount: "$54.99", status: "Under review" },
];

/** Recent platform events (payouts, disputes, activation, refunds). */
export const activities: Activity[] = [
  { name: "Payout sent", action: "IDR 58,900,000 to BCA ****4021", time: "16:05", day: "Today", avatar: "PO" },
  { name: "New dispute", action: "opened on order TRX-8790 ($120.00)", time: "13:05", day: "Today", avatar: "DP" },
  { name: "QRIS enabled", action: "Digital Payment channel is now live", time: "02:05", day: "Today", avatar: "QR" },
  { name: "Refund processed", action: "$45.00 refunded for TRX-8771", time: "21:05", day: "Yesterday", avatar: "RF" },
  { name: "DCB activation", action: "submitted for admin review", time: "09:05", day: "Yesterday", avatar: "DC" },
];
