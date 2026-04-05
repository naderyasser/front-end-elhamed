"use client";

import { useMemo, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Plus, Search, X } from "lucide-react";
import { clientsMock, type Client } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton-card";

const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    status: z.enum(["Active", "Inactive", "VIP", "At Risk"]),
    timezone: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

const badgeTone: Record<Client["status"], string> = {
    Active: "bg-success/15 text-success",
    Inactive: "bg-muted text-muted-foreground",
    VIP: "bg-yellow-300/20 text-yellow-700 dark:text-yellow-300",
    "At Risk": "bg-danger/15 text-danger",
};

function initials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function ClientsPage() {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<Client[]>(clientsMock);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<"All" | Client["status"]>("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Client | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            status: "Active",
            timezone: "Africa/Cairo",
        },
    });

    const filtered = useMemo(() => {
        return clients.filter((client) => {
            const textMatch =
                client.name.toLowerCase().includes(query.toLowerCase()) ||
                client.email.toLowerCase().includes(query.toLowerCase());
            const statusMatch = status === "All" ? true : client.status === status;

            const joined = new Date(client.joinDate);
            const fromMatch = fromDate ? joined >= new Date(fromDate) : true;
            const toMatch = toDate ? joined <= new Date(toDate) : true;
            return textMatch && statusMatch && fromMatch && toMatch;
        });
    }, [clients, query, status, fromDate, toDate]);

    function openCreate() {
        setEditing(null);
        form.reset({
            name: "",
            email: "",
            phone: "",
            status: "Active",
            timezone: "Africa/Cairo",
        });
        setModalOpen(true);
    }

    function openEdit(client: Client) {
        setEditing(client);
        form.reset({
            name: client.name,
            email: client.email,
            phone: client.phone,
            status: client.status,
            timezone: client.timezone,
        });
        setModalOpen(true);
    }

    function onSubmit(values: FormValues) {
        if (editing) {
            setClients((prev) =>
                prev.map((client) =>
                    client.id === editing.id
                        ? {
                            ...client,
                            name: values.name,
                            email: values.email,
                            phone: values.phone,
                            status: values.status,
                            timezone: values.timezone,
                        }
                        : client
                )
            );
        } else {
            const newClient: Client = {
                id: Date.now(),
                name: values.name,
                email: values.email,
                phone: values.phone,
                status: values.status,
                timezone: values.timezone,
                totalValue: 0,
                joinDate: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
            };
            setClients((prev) => [newClient, ...prev]);
        }
        setModalOpen(false);
    }

    function exportCsv() {
        const headers = [
            "name",
            "email",
            "phone",
            "status",
            "totalValue",
            "joinDate",
            "lastActivity",
        ];
        const lines = [headers.join(",")];
        filtered.forEach((client) => {
            lines.push(
                [
                    client.name,
                    client.email,
                    client.phone,
                    client.status,
                    client.totalValue,
                    client.joinDate,
                    client.lastActivity,
                ].join(",")
            );
        });

        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "clients-export.csv";
        link.click();
    }

    return (
        <div className="space-y-4">
            <section className="glass-card rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-[220px] flex-1">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search client by name or email"
                            className="w-full rounded-xl border border-border bg-muted py-2 pl-9 pr-3 text-sm"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as "All" | Client["status"])}
                        className="rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    >
                        <option>All</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>VIP</option>
                        <option>At Risk</option>
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

                    <button
                        aria-label="Export filtered clients to CSV"
                        onClick={exportCsv}
                        className="interactive ripple inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                        type="button"
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                    <button
                        aria-label="Add new client"
                        onClick={openCreate}
                        className="interactive ripple inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                        type="button"
                    >
                        <Plus className="h-4 w-4" /> Add Client
                    </button>
                </div>
            </section>

            <section className="glass-card rounded-xl p-4">
                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} className="h-12" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title="No clients found"
                        description="No matching clients. Try changing filters or add a new client."
                        actionLabel="Add client"
                        onAction={openCreate}
                    />
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="py-2">Client</th>
                                    <th className="py-2">Email</th>
                                    <th className="py-2">Phone</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Total value</th>
                                    <th className="py-2">Join date</th>
                                    <th className="py-2">Last activity</th>
                                    <th className="py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((client) => (
                                    <tr key={client.id} className="border-b border-border/70">
                                        <td className="py-2">
                                            <button
                                                aria-label={`Open details for ${client.name}`}
                                                onClick={() => setSelectedClient(client)}
                                                className="interactive flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-muted"
                                                type="button"
                                            >
                                                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                                                    {initials(client.name)}
                                                </span>
                                                <span>{client.name}</span>
                                            </button>
                                        </td>
                                        <td className="py-2 text-muted-foreground">{client.email}</td>
                                        <td className="py-2">{client.phone}</td>
                                        <td className="py-2">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${badgeTone[client.status]}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="py-2">{client.totalValue.toLocaleString()} EGP</td>
                                        <td className="py-2 text-muted-foreground">{new Date(client.joinDate).toLocaleDateString()}</td>
                                        <td className="py-2 text-muted-foreground">
                                            {formatDistanceToNow(new Date(client.lastActivity), { addSuffix: true })}
                                        </td>
                                        <td className="py-2 text-right">
                                            <button
                                                aria-label={`Edit ${client.name}`}
                                                onClick={() => openEdit(client)}
                                                className="interactive ripple rounded-lg border border-border px-2 py-1 text-xs"
                                                type="button"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedClient && (
                <div className="fixed inset-0 z-[75] bg-black/40" onClick={() => setSelectedClient(null)}>
                    <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-heading text-lg text-foreground">Client Profile</h2>
                            <button
                                aria-label="Close client details"
                                onClick={() => setSelectedClient(null)}
                                className="interactive ripple rounded-lg p-1 hover:bg-muted"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <p className="font-semibold text-foreground">{selectedClient.name}</p>
                            <p className="text-muted-foreground">{selectedClient.email}</p>
                            <p>{selectedClient.phone}</p>
                            <p className="text-muted-foreground">Timezone: {selectedClient.timezone}</p>
                            <p>Total value: {selectedClient.totalValue.toLocaleString()} EGP</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="mb-2 text-xs uppercase text-muted-foreground">Activity timeline</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="rounded-lg border border-border p-2">Joined platform</li>
                                <li className="rounded-lg border border-border p-2">Opened inquiry and requested proposal</li>
                                <li className="rounded-lg border border-border p-2">Latest activity in the past week</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-[76] grid place-items-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-heading text-lg text-foreground">{editing ? "Edit client" : "Add client"}</h2>
                        <div className="mt-3 grid gap-3">
                            <input placeholder="Name" className="rounded-xl border border-border bg-muted px-3 py-2 text-sm" {...form.register("name")} />
                            <input placeholder="Email" className="rounded-xl border border-border bg-muted px-3 py-2 text-sm" {...form.register("email")} />
                            <input placeholder="Phone" className="rounded-xl border border-border bg-muted px-3 py-2 text-sm" {...form.register("phone")} />
                            <select className="rounded-xl border border-border bg-muted px-3 py-2 text-sm" {...form.register("status")}>
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>VIP</option>
                                <option>At Risk</option>
                            </select>
                            <input placeholder="Timezone" className="rounded-xl border border-border bg-muted px-3 py-2 text-sm" {...form.register("timezone")} />
                        </div>

                        {Object.keys(form.formState.errors).length > 0 && (
                            <p className="mt-3 text-xs text-danger">Please provide valid values for all fields.</p>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                aria-label="Cancel client form"
                                onClick={() => setModalOpen(false)}
                                className="interactive ripple rounded-lg border border-border px-3 py-2 text-sm"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                aria-label="Save client"
                                className="interactive ripple rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                                type="submit"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
