"use client";

import { useMemo, useState, useEffect } from "react";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    closestCorners,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, LayoutList, KanbanSquare, X } from "lucide-react";
import { inquiriesMock, type Inquiry } from "@/lib/mock-data";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";

const columns: Inquiry["status"][] = ["New", "In Progress", "Proposal Sent", "Won", "Lost"];

const priorityTone: Record<Inquiry["priority"], string> = {
    High: "bg-danger/15 text-danger",
    Medium: "bg-warning/15 text-warning",
    Low: "bg-success/15 text-success",
};

function initials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function InquiryCard({ inquiry, onOpen }: { inquiry: Inquiry; onOpen: (item: Inquiry) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: String(inquiry.id),
        data: { status: inquiry.status },
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm"
            onClick={() => onOpen(inquiry)}
        >
            <div className="mb-2 flex items-center justify-between">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                    {initials(inquiry.clientName)}
                </span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${priorityTone[inquiry.priority]}`}>
                    {inquiry.priority}
                </span>
            </div>
            <p className="text-sm font-medium text-foreground">{inquiry.clientName}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{inquiry.subject}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">{new Date(inquiry.date).toLocaleDateString()}</p>
        </div>
    );
}

export default function InquiriesPage() {
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"kanban" | "list">("kanban");
    const [inquiries, setInquiries] = useState<Inquiry[]>(inquiriesMock);
    const [priorityFilter, setPriorityFilter] = useState<"All" | Inquiry["priority"]>("All");
    const [statusFilter, setStatusFilter] = useState<"All" | Inquiry["status"]>("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
    const [reply, setReply] = useState("");

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const filtered = useMemo(() => {
        return inquiries.filter((item) => {
            const statusOk = statusFilter === "All" ? true : item.status === statusFilter;
            const priorityOk = priorityFilter === "All" ? true : item.priority === priorityFilter;
            const d = new Date(item.date);
            const fromOk = fromDate ? d >= new Date(fromDate) : true;
            const toOk = toDate ? d <= new Date(toDate) : true;
            return statusOk && priorityOk && fromOk && toOk;
        });
    }, [inquiries, statusFilter, priorityFilter, fromDate, toDate]);

    const grouped = useMemo(() => {
        return columns.reduce<Record<string, Inquiry[]>>((acc, col) => {
            acc[col] = filtered.filter((item) => item.status === col);
            return acc;
        }, {});
    }, [filtered]);

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;
        const activeId = Number(active.id);

        const overId = String(over.id);
        const overColumn = columns.find((col) => col === overId);

        if (overColumn) {
            setInquiries((prev) =>
                prev.map((item) => (item.id === activeId ? { ...item, status: overColumn } : item))
            );
            return;
        }

        const target = inquiries.find((item) => item.id === Number(over.id));
        if (!target) return;

        setInquiries((prev) =>
            prev.map((item) => (item.id === activeId ? { ...item, status: target.status } : item))
        );
    }

    return (
        <div className="space-y-4">
            <section className="glass-card rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "All" | Inquiry["status"])}
                        className="rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    >
                        <option>All</option>
                        {columns.map((col) => (
                            <option key={col}>{col}</option>
                        ))}
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as "All" | Inquiry["priority"])}
                        className="rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    >
                        <option>All</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    />
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    />

                    <div className="ml-auto inline-flex rounded-xl border border-border bg-muted p-1">
                        <button
                            aria-label="Switch to Kanban view"
                            onClick={() => setView("kanban")}
                            className={`interactive ripple rounded-lg px-3 py-1.5 text-xs ${view === "kanban" ? "bg-card text-foreground" : "text-muted-foreground"}`}
                            type="button"
                        >
                            <KanbanSquare className="mr-1 inline h-3.5 w-3.5" /> Kanban
                        </button>
                        <button
                            aria-label="Switch to list view"
                            onClick={() => setView("list")}
                            className={`interactive ripple rounded-lg px-3 py-1.5 text-xs ${view === "list" ? "bg-card text-foreground" : "text-muted-foreground"}`}
                            type="button"
                        >
                            <LayoutList className="mr-1 inline h-3.5 w-3.5" /> List
                        </button>
                    </div>
                </div>
            </section>

            {loading ? (
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonCard key={i} className="h-72" />
                    ))}
                </section>
            ) : filtered.length === 0 ? (
                <EmptyState
                    title="No inquiries match your filters"
                    description="Try different filters or add a new inquiry to start your pipeline."
                    actionLabel="Reset filters"
                    onAction={() => {
                        setStatusFilter("All");
                        setPriorityFilter("All");
                        setFromDate("");
                        setToDate("");
                    }}
                />
            ) : view === "kanban" ? (
                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
                    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        {columns.map((column) => (
                            <div key={column} id={column} className="glass-card rounded-xl p-3">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-foreground">{column}</h3>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                        {grouped[column]?.length ?? 0}
                                    </span>
                                </div>

                                <SortableContext
                                    id={column}
                                    items={(grouped[column] ?? []).map((item) => String(item.id))}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2" id={column}>
                                        {(grouped[column] ?? []).map((item) => (
                                            <InquiryCard key={item.id} inquiry={item} onOpen={setActiveInquiry} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        ))}
                    </section>
                </DndContext>
            ) : (
                <section className="glass-card rounded-xl p-4">
                    <div className="overflow-auto">
                        <table className="w-full min-w-[860px] text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="py-2">Client</th>
                                    <th className="py-2">Subject</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Priority</th>
                                    <th className="py-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item) => (
                                    <tr key={item.id} className="border-b border-border/70" onClick={() => setActiveInquiry(item)}>
                                        <td className="py-2">{item.clientName}</td>
                                        <td className="py-2">{item.subject}</td>
                                        <td className="py-2">{item.status}</td>
                                        <td className="py-2">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${priorityTone[item.priority]}`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className="py-2 text-muted-foreground">{new Date(item.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeInquiry && (
                <div className="fixed inset-0 z-[76] grid place-items-center bg-black/50 p-4" onClick={() => setActiveInquiry(null)}>
                    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-heading text-lg text-foreground">Inquiry Details</h2>
                            <button
                                aria-label="Close inquiry details"
                                onClick={() => setActiveInquiry(null)}
                                className="interactive ripple rounded-lg p-1 hover:bg-muted"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold text-foreground">{activeInquiry.clientName}</p>
                                <p>{activeInquiry.subject}</p>
                                <p className="text-muted-foreground">Status: {activeInquiry.status}</p>
                                <p className="text-muted-foreground">
                                    <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                                    {new Date(activeInquiry.date).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="mb-1 text-xs uppercase text-muted-foreground">Activity log</h3>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {activeInquiry.notes.map((note, idx) => (
                                        <li key={idx} className="rounded-lg border border-border p-2">
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="mb-1 text-xs uppercase text-muted-foreground">Reply</h3>
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                rows={4}
                                placeholder="Write your reply..."
                                className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                            />
                            <div className="mt-2 flex justify-end">
                                <button
                                    aria-label="Send inquiry reply"
                                    onClick={() => {
                                        setReply("");
                                        setActiveInquiry(null);
                                    }}
                                    className="interactive ripple rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                                    type="button"
                                >
                                    Send reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
