"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect, Suspense } from "react";
import {
    Cell,
    Pie,
    PieChart,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { Archive, ArrowUpDown, Check, Mail, UserRound } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
    funnelMock,
    generateActivityGrid,
    inquiriesMock,
    statsCardsMock,
    trafficSourcesMock,
} from "@/lib/mock-data";

const FunnelChart = dynamic(() => import("@/components/dashboard/funnel-chart"), {
    ssr: false,
    loading: () => <SkeletonCard className="h-72" />,
});

const ActivityGrid = dynamic(() => import("@/components/dashboard/activity-grid"), {
    ssr: false,
    loading: () => <SkeletonCard className="h-48" />,
});

type InquiryRow = (typeof inquiriesMock)[number];
type SortKey = "clientName" | "subject" | "priority" | "date";

const priorities = {
    High: "bg-danger/15 text-danger",
    Medium: "bg-warning/15 text-warning",
    Low: "bg-success/15 text-success",
};

const tourSteps = [
    "These cards summarize your top KPIs with trend lines and deltas.",
    "This analytics zone shows funnel, activity and traffic quality.",
    "Manage inquiries with bulk actions, sorting and pagination.",
    "Use quick actions from the right panel for faster workflows.",
    "Go to Settings to customize profile, notifications and appearance.",
];

function initials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [rows, setRows] = useState<InquiryRow[]>(inquiriesMock);
    const [selected, setSelected] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState<SortKey>("date");
    const [sortAsc, setSortAsc] = useState(false);
    const [page, setPage] = useState(1);
    const [tourStep, setTourStep] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 900);
        const completedTour = localStorage.getItem("dashboard-tour-complete");
        if (!completedTour) setTourStep(0);
        return () => clearTimeout(timer);
    }, []);

    const sorted = useMemo(() => {
        const copy = [...rows];
        copy.sort((a, b) => {
            const av = a[sortBy];
            const bv = b[sortBy];
            if (sortBy === "date") {
                const diff = new Date(av).getTime() - new Date(bv).getTime();
                return sortAsc ? diff : -diff;
            }
            return sortAsc
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });
        return copy;
    }, [rows, sortBy, sortAsc]);

    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const paginated = sorted.slice((page - 1) * perPage, page * perPage);

    function toggleSort(key: SortKey) {
        if (sortBy === key) setSortAsc((prev) => !prev);
        else {
            setSortBy(key);
            setSortAsc(true);
        }
    }

    function toggleSelect(id: number) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    function selectAllCurrent(checked: boolean) {
        if (checked) {
            setSelected((prev) => [...new Set([...prev, ...paginated.map((row) => row.id)])]);
            return;
        }
        setSelected((prev) => prev.filter((id) => !paginated.some((row) => row.id === id)));
    }

    function closeTour() {
        setTourStep(null);
        localStorage.setItem("dashboard-tour-complete", "1");
    }

    const responseGauge = [{ name: "Response", value: 78, fill: "#2A9D8F" }];

    return (
        <div className="space-y-6">
            <section id="tour-stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statsCardsMock.map((card) => (
                    <StatsCard
                        key={card.id}
                        title={card.title}
                        value={card.value}
                        suffix={card.suffix}
                        changePercent={card.changePercent}
                        trend={card.trend}
                        details={card.details}
                        loading={loading}
                        expanded={expandedCard === card.id}
                        onToggle={() => setExpandedCard((prev) => (prev === card.id ? null : card.id))}
                    />
                ))}
            </section>

            <section id="tour-charts" className="overflow-x-auto pb-2 md:overflow-visible">
                <div className="flex snap-x gap-4 md:grid md:grid-cols-2">
                    <div className="min-w-[92%] snap-center md:min-w-0">
                        <Suspense fallback={<SkeletonCard className="h-72" />}>
                            <FunnelChart data={funnelMock} />
                        </Suspense>
                    </div>
                    <div className="min-w-[92%] snap-center md:min-w-0">
                        <Suspense fallback={<SkeletonCard className="h-72" />}>
                            <ActivityGrid data={generateActivityGrid()} />
                        </Suspense>
                    </div>
                    <div className="min-w-[92%] snap-center md:min-w-0">
                        <div className="glass-card rounded-xl p-4">
                            <h3 className="font-heading text-lg text-foreground">Top Traffic Sources</h3>
                            <p className="mb-3 text-xs text-muted-foreground">Most valuable channels this period</p>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={trafficSourcesMock} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86}>
                                            {trafficSourcesMock.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {trafficSourcesMock.map((source) => (
                                    <div key={source.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: source.color }} />
                                        {source.name} ({source.value}%)
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="min-w-[92%] snap-center md:min-w-0">
                        <div className="glass-card rounded-xl p-4">
                            <h3 className="font-heading text-lg text-foreground">Response Time Gauge</h3>
                            <p className="mb-3 text-xs text-muted-foreground">Speed score based on SLA and queue load</p>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        innerRadius="60%"
                                        outerRadius="100%"
                                        data={responseGauge}
                                        startAngle={180}
                                        endAngle={0}
                                    >
                                        <RadialBar dataKey="value" cornerRadius={12} />
                                        <Tooltip />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">Current score: 78/100</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="tour-inquiries" className="glass-card rounded-xl p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-heading text-lg text-foreground">Recent Inquiries</h3>
                    <div className="flex items-center gap-2">
                        <button
                            aria-label="Archive selected inquiries"
                            type="button"
                            className="interactive ripple rounded-lg border border-border px-3 py-1.5 text-xs"
                        >
                            Archive selected ({selected.length})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonCard key={i} className="h-12" />
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <EmptyState
                        title="No inquiries yet"
                        description="No inquiries yet. Start by adding your first client."
                        actionLabel="Add first client"
                        onAction={() => { }}
                    />
                ) : (
                    <>
                        <div className="overflow-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="py-2">
                                            <input
                                                aria-label="Select all inquiries on page"
                                                type="checkbox"
                                                checked={paginated.every((row) => selected.includes(row.id))}
                                                onChange={(e) => selectAllCurrent(e.target.checked)}
                                            />
                                        </th>
                                        <th className="py-2">
                                            <button
                                                aria-label="Sort by client"
                                                className="inline-flex items-center gap-1"
                                                onClick={() => toggleSort("clientName")}
                                            >
                                                Client <ArrowUpDown className="h-3.5 w-3.5" />
                                            </button>
                                        </th>
                                        <th className="py-2">
                                            <button
                                                aria-label="Sort by inquiry subject"
                                                className="inline-flex items-center gap-1"
                                                onClick={() => toggleSort("subject")}
                                            >
                                                Subject <ArrowUpDown className="h-3.5 w-3.5" />
                                            </button>
                                        </th>
                                        <th className="py-2">
                                            <button
                                                aria-label="Sort by priority"
                                                className="inline-flex items-center gap-1"
                                                onClick={() => toggleSort("priority")}
                                            >
                                                Priority <ArrowUpDown className="h-3.5 w-3.5" />
                                            </button>
                                        </th>
                                        <th className="py-2">
                                            <button
                                                aria-label="Sort by date"
                                                className="inline-flex items-center gap-1"
                                                onClick={() => toggleSort("date")}
                                            >
                                                Date <ArrowUpDown className="h-3.5 w-3.5" />
                                            </button>
                                        </th>
                                        <th className="py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((row) => (
                                        <tr key={row.id} className="border-b border-border/70">
                                            <td className="py-2">
                                                <input
                                                    aria-label={`Select inquiry ${row.subject}`}
                                                    type="checkbox"
                                                    checked={selected.includes(row.id)}
                                                    onChange={() => toggleSelect(row.id)}
                                                />
                                            </td>
                                            <td className="py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                                                        {initials(row.clientName)}
                                                    </div>
                                                    <span>{row.clientName}</span>
                                                </div>
                                            </td>
                                            <td className="py-2">{row.subject}</td>
                                            <td className="py-2">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${priorities[row.priority]}`}>
                                                    {row.priority}
                                                </span>
                                            </td>
                                            <td className="py-2 text-muted-foreground">{new Date(row.date).toLocaleDateString()}</td>
                                            <td className="py-2">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        aria-label={`Reply to ${row.clientName}`}
                                                        className="interactive ripple rounded-md border border-border p-1.5"
                                                        type="button"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        aria-label={`Archive inquiry ${row.id}`}
                                                        className="interactive ripple rounded-md border border-border p-1.5"
                                                        type="button"
                                                    >
                                                        <Archive className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        aria-label={`Mark inquiry ${row.id} as done`}
                                                        className="interactive ripple rounded-md border border-border p-1.5"
                                                        type="button"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    aria-label="Previous page"
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    className="interactive ripple rounded-lg border border-border px-2 py-1"
                                    disabled={page === 1}
                                    type="button"
                                >
                                    Previous
                                </button>
                                <button
                                    aria-label="Next page"
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                    className="interactive ripple rounded-lg border border-border px-2 py-1"
                                    disabled={page === totalPages}
                                    type="button"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {tourStep !== null && (
                <div className="fixed inset-0 z-[75] bg-black/55 p-4">
                    <div className="mx-auto mt-[16vh] w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-lg">
                        <p className="text-xs text-muted-foreground">Onboarding tour ({tourStep + 1}/5)</p>
                        <p className="mt-2 text-sm text-foreground">{tourSteps[tourStep]}</p>
                        <div className="mt-4 flex justify-between">
                            <button
                                aria-label="Skip onboarding tour"
                                onClick={closeTour}
                                className="interactive ripple rounded-lg border border-border px-3 py-1.5 text-xs"
                                type="button"
                            >
                                Skip tour
                            </button>
                            <button
                                aria-label="Next tour step"
                                onClick={() => {
                                    if (tourStep >= 4) {
                                        closeTour();
                                        return;
                                    }
                                    setTourStep((prev) => (prev === null ? null : prev + 1));
                                }}
                                className="interactive ripple rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                                type="button"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div id="tour-settings" className="hidden" aria-hidden="true">
                <UserRound className="h-4 w-4" />
            </div>
        </div>
    );
}
