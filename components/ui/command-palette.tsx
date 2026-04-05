"use client";

import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clientsMock, commandActions, commandPages, inquiriesMock } from "@/lib/mock-data";

interface SearchItem {
    title: string;
    href: string;
    category: string;
}

function highlight(text: string, term: string) {
    if (!term) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="rounded bg-accent/20 px-0.5 text-foreground">{text.slice(idx, idx + term.length)}</mark>
            {text.slice(idx + term.length)}
        </>
    );
}

export function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [recent, setRecent] = useState<SearchItem[]>([]);

    useEffect(() => {
        const raw = localStorage.getItem("cmdk-recent");
        if (raw) {
            try {
                setRecent(JSON.parse(raw) as SearchItem[]);
            } catch {
                setRecent([]);
            }
        }
    }, []);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        const onExternalOpen = () => setOpen(true);
        window.addEventListener("keydown", onKey);
        window.addEventListener("open-command-palette", onExternalOpen as EventListener);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("open-command-palette", onExternalOpen as EventListener);
        };
    }, []);

    const results = useMemo(() => {
        const clients: SearchItem[] = clientsMock.map((c) => ({
            title: `${c.name} (${c.email})`,
            href: "/dashboard/clients",
            category: "Clients",
        }));
        const inquiries: SearchItem[] = inquiriesMock.map((i) => ({
            title: i.subject,
            href: "/dashboard/inquiries",
            category: "Inquiries",
        }));

        return [...commandPages, ...commandActions, ...clients, ...inquiries];
    }, []);

    const filtered = useMemo(() => {
        if (!search) return results;
        return results.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
    }, [results, search]);

    function onSelect(item: SearchItem) {
        const updated = [item, ...recent.filter((x) => x.title !== item.title)].slice(0, 6);
        setRecent(updated);
        localStorage.setItem("cmdk-recent", JSON.stringify(updated));
        router.push(item.href);
        setOpen(false);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-black/50 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <div
                className="mx-auto mt-[10vh] w-full max-w-2xl rounded-2xl border border-border bg-card shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <Command className="p-2" label="Global search">
                    <div className="flex items-center gap-2 border-b border-border px-2 pb-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Command.Input
                            autoFocus
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search pages, clients, inquiries, actions..."
                            className="w-full bg-transparent py-2 text-sm text-foreground outline-none"
                        />
                    </div>

                    <Command.List className="max-h-[60vh] overflow-auto p-2">
                        <Command.Empty className="p-4 text-sm text-muted-foreground">No results found.</Command.Empty>

                        {!search && recent.length > 0 && (
                            <Command.Group heading="Recent searches" className="mb-2">
                                {recent.map((item) => (
                                    <Command.Item
                                        key={`recent-${item.title}`}
                                        onSelect={() => onSelect(item)}
                                        className="interactive cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground data-[selected=true]:bg-muted"
                                    >
                                        <span className="mr-2 text-xs text-muted-foreground">{item.category}</span>
                                        {item.title}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {filtered.map((item) => (
                            <Command.Item
                                key={`${item.category}-${item.title}`}
                                onSelect={() => onSelect(item)}
                                className="interactive cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground data-[selected=true]:bg-muted"
                            >
                                <span className="mr-2 text-xs text-muted-foreground">{item.category}</span>
                                {highlight(item.title, search)}
                            </Command.Item>
                        ))}
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
