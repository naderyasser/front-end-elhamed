// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export type NotificationType = "success" | "info" | "warning";

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

export type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive" | "VIP" | "At Risk";
  timezone: string;
  totalValue: number;
  joinDate: string;
  lastActivity: string;
};

export type Inquiry = {
  id: number;
  clientName: string;
  subject: string;
  status: "New" | "In Progress" | "Proposal Sent" | "Won" | "Lost";
  priority: "High" | "Medium" | "Low";
  date: string;
  notes: string[];
};

// ──────────────────────────────────────────────────────────────
// Clients
// ──────────────────────────────────────────────────────────────

export const clientsMock: Client[] = [
  {
    id: 1,
    name: "Sara Hassan",
    email: "sara.hassan@example.com",
    phone: "+20 100 123 4567",
    status: "VIP",
    timezone: "Africa/Cairo",
    totalValue: 84500,
    joinDate: "2024-03-15T10:00:00Z",
    lastActivity: "2026-04-01T08:30:00Z",
  },
  {
    id: 2,
    name: "Mohamed Tarek",
    email: "m.tarek@example.com",
    phone: "+20 101 987 6543",
    status: "Active",
    timezone: "Africa/Cairo",
    totalValue: 32000,
    joinDate: "2024-07-20T09:00:00Z",
    lastActivity: "2026-03-29T14:00:00Z",
  },
  {
    id: 3,
    name: "Nour El-Din",
    email: "nour@example.com",
    phone: "+20 112 555 8899",
    status: "Active",
    timezone: "Africa/Cairo",
    totalValue: 17200,
    joinDate: "2024-11-01T07:00:00Z",
    lastActivity: "2026-03-25T11:00:00Z",
  },
  {
    id: 4,
    name: "Rania Samir",
    email: "rania.samir@example.com",
    phone: "+20 106 777 3344",
    status: "Inactive",
    timezone: "Africa/Cairo",
    totalValue: 5800,
    joinDate: "2023-09-10T12:00:00Z",
    lastActivity: "2025-12-01T09:00:00Z",
  },
  {
    id: 5,
    name: "Khaled Ibrahim",
    email: "k.ibrahim@example.com",
    phone: "+20 115 444 2211",
    status: "At Risk",
    timezone: "Africa/Cairo",
    totalValue: 12000,
    joinDate: "2024-01-05T08:00:00Z",
    lastActivity: "2026-02-14T16:00:00Z",
  },
  {
    id: 6,
    name: "Dina Mostafa",
    email: "dina.m@example.com",
    phone: "+20 100 321 9876",
    status: "Active",
    timezone: "Africa/Cairo",
    totalValue: 26700,
    joinDate: "2024-05-22T10:30:00Z",
    lastActivity: "2026-04-02T10:00:00Z",
  },
  {
    id: 7,
    name: "Youssef Gamal",
    email: "y.gamal@example.com",
    phone: "+20 111 654 3210",
    status: "VIP",
    timezone: "Africa/Cairo",
    totalValue: 97000,
    joinDate: "2023-06-18T09:00:00Z",
    lastActivity: "2026-04-02T15:00:00Z",
  },
  {
    id: 8,
    name: "Aya Khalil",
    email: "aya.khalil@example.com",
    phone: "+20 103 888 5566",
    status: "Active",
    timezone: "Africa/Cairo",
    totalValue: 9300,
    joinDate: "2025-02-11T11:00:00Z",
    lastActivity: "2026-03-30T13:00:00Z",
  },
];

// ──────────────────────────────────────────────────────────────
// Inquiries
// ──────────────────────────────────────────────────────────────

export const inquiriesMock: Inquiry[] = [
  {
    id: 1,
    clientName: "Sara Hassan",
    subject: "Request for premium skincare bundle quote",
    status: "Won",
    priority: "High",
    date: "2026-03-10T09:00:00Z",
    notes: ["Initial inquiry received", "Proposal sent with 3 options", "Client accepted bundle B"],
  },
  {
    id: 2,
    clientName: "Mohamed Tarek",
    subject: "Wholesale pricing for hair care line",
    status: "Proposal Sent",
    priority: "High",
    date: "2026-03-18T11:00:00Z",
    notes: ["Received inquiry via WhatsApp", "Sent detailed pricing sheet"],
  },
  {
    id: 3,
    clientName: "Nour El-Din",
    subject: "Product availability and delivery timeline",
    status: "In Progress",
    priority: "Medium",
    date: "2026-03-22T14:00:00Z",
    notes: ["Checking stock levels", "Coordinating with logistics team"],
  },
  {
    id: 4,
    clientName: "Rania Samir",
    subject: "Return request for damaged serum",
    status: "New",
    priority: "High",
    date: "2026-03-28T08:30:00Z",
    notes: ["Client reported damage in transit"],
  },
  {
    id: 5,
    clientName: "Khaled Ibrahim",
    subject: "Bulk order for gifting season",
    status: "In Progress",
    priority: "Medium",
    date: "2026-03-25T10:00:00Z",
    notes: ["Discussing custom packaging", "Awaiting artwork approval"],
  },
  {
    id: 6,
    clientName: "Dina Mostafa",
    subject: "Loyalty program enrollment query",
    status: "New",
    priority: "Low",
    date: "2026-04-01T09:00:00Z",
    notes: ["Interested in VIP tier benefits"],
  },
  {
    id: 7,
    clientName: "Youssef Gamal",
    subject: "Annual contract renewal discussion",
    status: "Won",
    priority: "High",
    date: "2026-02-15T08:00:00Z",
    notes: ["Contract reviewed", "Renewed with 15% volume discount", "Payment confirmed"],
  },
  {
    id: 8,
    clientName: "Aya Khalil",
    subject: "Subscription box customization",
    status: "Lost",
    priority: "Medium",
    date: "2026-03-05T13:00:00Z",
    notes: ["Discussed options", "Client went with competitor pricing"],
  },
];

// ──────────────────────────────────────────────────────────────
// Stats cards
// ──────────────────────────────────────────────────────────────

export const statsCardsMock = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: 347200,
    suffix: " EGP",
    changePercent: 12.4,
    trend: [210, 245, 280, 260, 310, 347],
    details: "Revenue is up 12.4% compared to the same period last month.",
  },
  {
    id: "clients",
    title: "Active Clients",
    value: 128,
    changePercent: 8.1,
    trend: [90, 95, 102, 110, 118, 128],
    details: "8 new clients onboarded this month.",
  },
  {
    id: "inquiries",
    title: "Open Inquiries",
    value: 34,
    changePercent: -5.2,
    trend: [52, 48, 41, 38, 36, 34],
    details: "Pipeline shrinking — push for closures this week.",
  },
  {
    id: "conversion",
    title: "Conversion Rate",
    value: 24,
    suffix: "%",
    changePercent: 3.7,
    trend: [18, 19, 21, 20, 23, 24],
    details: "Conversion improved due to faster proposal turnaround.",
  },
];

// ──────────────────────────────────────────────────────────────
// Traffic sources
// ──────────────────────────────────────────────────────────────

export const trafficSourcesMock = [
  { name: "Direct", value: 38, color: "#0077B6" },
  { name: "Referral", value: 25, color: "#2A9D8F" },
  { name: "Social", value: 20, color: "#E9C46A" },
  { name: "Search", value: 12, color: "#E76F51" },
  { name: "Email", value: 5, color: "#A8DADC" },
];

// ──────────────────────────────────────────────────────────────
// Funnel
// ──────────────────────────────────────────────────────────────

export const funnelMock = [
  { stage: "Visitors", value: 5200 },
  { stage: "Inquiries", value: 1840 },
  { stage: "Proposals", value: 620 },
  { stage: "Clients", value: 128 },
];

// ──────────────────────────────────────────────────────────────
// Activity grid
// ──────────────────────────────────────────────────────────────

export function generateActivityGrid() {
  const cells: { date: string; value: number }[] = [];
  const today = new Date();
  const totalCells = 84; // 12 columns × 7 rows
  for (let i = totalCells - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    cells.push({
      date: d.toISOString().split("T")[0],
      value: Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 6),
    });
  }
  return cells;
}

// ──────────────────────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────────────────────

export const initialNotifications: AppNotification[] = [
  {
    id: 1,
    type: "success",
    title: "New order received",
    description: "Sara Hassan placed a new order worth 4,200 EGP.",
    createdAt: "2026-04-02T10:15:00Z",
    read: false,
  },
  {
    id: 2,
    type: "info",
    title: "Inquiry updated",
    description: "Mohamed Tarek inquiry moved to Proposal Sent.",
    createdAt: "2026-04-01T14:30:00Z",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Low stock alert",
    description: "Rose Serum stock dropped below 10 units.",
    createdAt: "2026-03-31T08:00:00Z",
    read: true,
  },
  {
    id: 4,
    type: "warning",
    title: "Payment failed",
    description: "Payment for order #1042 was declined by the gateway.",
    createdAt: "2026-03-30T17:45:00Z",
    read: true,
  },
];

// ──────────────────────────────────────────────────────────────
// Command palette
// ──────────────────────────────────────────────────────────────

export const commandPages = [
  { title: "Dashboard", href: "/dashboard", category: "Pages" },
  { title: "Clients", href: "/dashboard/clients", category: "Pages" },
  { title: "Inquiries", href: "/dashboard/inquiries", category: "Pages" },
  { title: "Settings", href: "/dashboard/settings", category: "Pages" },
];

export const commandActions = [
  { title: "Add new client", href: "/dashboard/clients?action=new", category: "Actions" },
  { title: "Export clients CSV", href: "/dashboard/clients?action=export", category: "Actions" },
  { title: "View open inquiries", href: "/dashboard/inquiries?status=New", category: "Actions" },
];
