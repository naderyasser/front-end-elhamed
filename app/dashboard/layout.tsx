"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    BarChart3,
    CalendarDays,
    ChevronLeft,
    FileDown,
    Mail,
    Menu,
    MessageSquare,
    NotebookPen,
    PanelRightClose,
    PanelRightOpen,
    Search,
    Settings,
    Users,
    X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/ui/notification-bell";
import { useNotifications } from "@/contexts/notification-context";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/inquiries", label: "Inquiries", icon: MessageSquare },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    const crumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        return { href, label };
    });

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
            {crumbs.map((crumb, index) => (
                <span key={crumb.href} className="inline-flex items-center gap-1">
                    {index > 0 && <ChevronLeft className="h-3.5 w-3.5" />}
                    <Link href={crumb.href} className="interactive rounded-md px-1.5 py-1 hover:bg-muted hover:text-foreground">
                        {crumb.label}
                    </Link>
                </span>
            ))}
        </nav>
    );
}

function ModalShell({
    open,
    title,
    onClose,
    children,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[75] grid place-items-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-heading text-lg text-foreground">{title}</h2>
                    <button
                        aria-label="Close modal"
                        onClick={onClose}
                        className="interactive ripple rounded-lg p-1 text-muted-foreground hover:bg-muted"
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [quickActionsOpen, setQuickActionsOpen] = useState(true);
    const [meetingOpen, setMeetingOpen] = useState(false);
    const [emailOpen, setEmailOpen] = useState(false);
    const [noteOpen, setNoteOpen] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const touchStartY = useRef<number | null>(null);
    const touchStartX = useRef<number | null>(null);
    const { addNotification } = useNotifications();

    const pageTitle = useMemo(() => {
        const current = navItems.find((item) => item.href === pathname);
        return current?.label ?? "Dashboard";
    }, [pathname]);

    const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
        if (window.scrollY === 0) {
            touchStartY.current = event.touches[0].clientY;
        }
    };

    const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (event) => {
        if (touchStartY.current === null) return;
        const diff = event.touches[0].clientY - touchStartY.current;
        if (diff > 0) {
            setPullDistance(Math.min(diff, 110));
        }
    };

    const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
        if (pullDistance > 90) {
            addNotification({
                type: "info",
                title: "Refreshing",
                description: "Dashboard data is being refreshed.",
            });
            window.location.reload();
        }
        setPullDistance(0);
        touchStartY.current = null;
    };

    const triggerCommandPalette = () => {
        window.dispatchEvent(new Event("open-command-palette"));
    };

    const generateReport = () => {
        setReportLoading(true);
        setTimeout(() => {
            const blob = new Blob(["Mock report generated successfully"], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "dashboard-report.pdf";
            a.click();
            URL.revokeObjectURL(url);
            setReportLoading(false);
            addNotification({
                type: "success",
                title: "Report ready",
                description: "Your mock PDF report has been downloaded.",
            });
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.14),transparent_32%),radial-gradient(circle_at_100%_100%,hsl(var(--secondary)/0.2),transparent_30%)]">
            <div
                className="fixed left-1/2 top-0 z-[55] h-1 w-[140px] -translate-x-1/2 rounded-b-full bg-primary/40 transition-all"
                style={{ transform: `translate(-50%, 0) scaleX(${Math.max(0.2, pullDistance / 100)})` }}
            />

            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:border-border lg:bg-card/70 lg:backdrop-blur-md">
                <div className="px-5 py-6">
                    <p className="font-heading text-xl text-foreground">ALHAMED</p>
                    <p className="text-xs text-muted-foreground">Commerce and service command center</p>
                </div>

                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-label={item.label}
                                className="relative block rounded-xl px-3 py-2.5"
                            >
                                {active && (
                                    <motion.span
                                        layoutId="active-pill"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        className="absolute inset-0 rounded-xl bg-primary/15"
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-3 text-sm text-foreground">
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 280, damping: 30 }}
                            className="fixed inset-y-0 right-0 z-[65] w-[84vw] max-w-xs border-l border-border bg-card p-4 lg:hidden"
                            onTouchStart={(e) => {
                                touchStartX.current = e.touches[0].clientX;
                            }}
                            onTouchMove={(e) => {
                                if (touchStartX.current === null) return;
                                const delta = e.touches[0].clientX - touchStartX.current;
                                if (delta < -70) {
                                    setSidebarOpen(false);
                                }
                            }}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <p className="font-heading text-lg text-foreground">Navigation</p>
                                <button
                                    aria-label="Close sidebar"
                                    onClick={() => setSidebarOpen(false)}
                                    className="interactive ripple rounded-lg p-2 hover:bg-muted"
                                    type="button"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        aria-label={item.label}
                                        className={`block rounded-xl px-3 py-3 text-sm ${pathname === item.href ? "bg-primary/15 text-primary" : "text-foreground hover:bg-muted"}`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className="lg:pl-[260px]">
                <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:px-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-heading text-lg text-foreground">{pageTitle}</p>
                            <Breadcrumbs />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                aria-label="Open navigation"
                                onClick={() => setSidebarOpen(true)}
                                className="interactive ripple inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card lg:hidden"
                                type="button"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            <button
                                aria-label="Open global search"
                                onClick={triggerCommandPalette}
                                className="interactive ripple hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:inline-flex"
                                type="button"
                            >
                                <Search className="h-4 w-4" />
                                Search
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Ctrl+K</span>
                            </button>

                            <NotificationBell />
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <div className="relative lg:pr-[280px]">
                    <div
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        className="px-4 py-5 pb-24 lg:px-6 lg:pb-8"
                    >
                        <AnimatePresence mode="wait">
                            <motion.main
                                id="main-content"
                                key={pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22 }}
                            >
                                {children}
                            </motion.main>
                        </AnimatePresence>
                    </div>

                    <aside
                        className={`fixed right-0 top-[69px] hidden h-[calc(100vh-69px)] w-[280px] border-l border-border bg-card/70 p-4 backdrop-blur-md lg:block ${quickActionsOpen ? "translate-x-0" : "translate-x-[238px]"
                            } transition-transform`}
                    >
                        <button
                            aria-label="Toggle quick actions panel"
                            onClick={() => setQuickActionsOpen((prev) => !prev)}
                            className="interactive ripple absolute -left-10 top-3 inline-flex h-8 w-8 items-center justify-center rounded-l-lg border border-r-0 border-border bg-card"
                            type="button"
                        >
                            {quickActionsOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                        </button>

                        <h3 className="font-heading text-base text-foreground">Quick Actions</h3>
                        <div className="mt-3 space-y-2">
                            <button
                                aria-label="Schedule meeting"
                                onClick={() => setMeetingOpen(true)}
                                className="interactive ripple flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted"
                                type="button"
                            >
                                <CalendarDays className="h-4 w-4" /> Schedule Meeting
                            </button>
                            <button
                                aria-label="Send email"
                                onClick={() => setEmailOpen(true)}
                                className="interactive ripple flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted"
                                type="button"
                            >
                                <Mail className="h-4 w-4" /> Send Email
                            </button>
                            <button
                                aria-label="Add note"
                                onClick={() => setNoteOpen(true)}
                                className="interactive ripple flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted"
                                type="button"
                            >
                                <NotebookPen className="h-4 w-4" /> Add Note
                            </button>
                            <button
                                aria-label="Generate report"
                                onClick={generateReport}
                                className="interactive ripple flex w-full items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                                type="button"
                            >
                                <FileDown className="h-4 w-4" /> {reportLoading ? "Generating..." : "Generate Report"}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-border bg-card/95 px-2 py-2 backdrop-blur md:hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.label}
                            className={`interactive flex min-h-11 flex-col items-center justify-center rounded-xl text-[11px] ${active ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            <Icon className="mb-1 h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <ModalShell open={meetingOpen} title="Schedule meeting" onClose={() => setMeetingOpen(false)}>
                <form className="space-y-3">
                    <input
                        type="datetime-local"
                        className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    />
                    <button
                        aria-label="Confirm meeting schedule"
                        onClick={(e) => {
                            e.preventDefault();
                            setMeetingOpen(false);
                            addNotification({
                                type: "success",
                                title: "Meeting scheduled",
                                description: "A new meeting was added to your calendar.",
                            });
                        }}
                        className="interactive ripple rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                        type="submit"
                    >
                        Confirm
                    </button>
                </form>
            </ModalShell>

            <ModalShell open={emailOpen} title="Compose email" onClose={() => setEmailOpen(false)}>
                <form className="space-y-3">
                    <input placeholder="To" className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm" />
                    <input placeholder="Subject" className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm" />
                    <textarea
                        placeholder="Message"
                        rows={5}
                        className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    />
                    <button
                        aria-label="Send email"
                        onClick={(e) => {
                            e.preventDefault();
                            setEmailOpen(false);
                            addNotification({
                                type: "success",
                                title: "Email queued",
                                description: "Your message was queued for delivery.",
                            });
                        }}
                        className="interactive ripple rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                        type="submit"
                    >
                        Send
                    </button>
                </form>
            </ModalShell>

            <ModalShell open={noteOpen} title="Quick note" onClose={() => setNoteOpen(false)}>
                <form className="space-y-3">
                    <textarea
                        rows={4}
                        placeholder="Type your note"
                        className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    />
                    <input
                        placeholder="Tags (comma separated)"
                        className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm"
                    />
                    <button
                        aria-label="Save note"
                        onClick={(e) => {
                            e.preventDefault();
                            setNoteOpen(false);
                            addNotification({
                                type: "info",
                                title: "Note saved",
                                description: "Your note was added to activity timeline.",
                            });
                        }}
                        className="interactive ripple rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                        type="submit"
                    >
                        Save note
                    </button>
                </form>
            </ModalShell>
        </div>
    );
}
