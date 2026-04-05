"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Info, TriangleAlert, CircleCheckBig } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/contexts/notification-context";

function iconByType(type: "info" | "success" | "warning") {
    if (type === "success") return <CircleCheckBig className="h-4 w-4 text-success" />;
    if (type === "warning") return <TriangleAlert className="h-4 w-4 text-warning" />;
    return <Info className="h-4 w-4 text-secondary" />;
}

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { notifications, unreadCount, markAllAsRead } = useNotifications();

    return (
        <div className="relative">
            <button
                aria-label="Open notifications"
                onClick={() => setOpen((prev) => !prev)}
                className="interactive ripple relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm"
                type="button"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute left-0 mt-2 w-[360px] max-w-[90vw] rounded-2xl border border-border bg-card p-2 shadow-lg">
                    <div className="mb-2 flex items-center justify-between px-2 py-1">
                        <h3 className="font-heading text-sm text-foreground">Notifications</h3>
                        <button
                            aria-label="Mark all notifications as read"
                            onClick={markAllAsRead}
                            className="interactive ripple inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                            type="button"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all as read
                        </button>
                    </div>
                    <div className="max-h-80 space-y-1 overflow-auto pr-1">
                        {notifications.slice(0, 10).map((item) => (
                            <div
                                key={item.id}
                                className={`rounded-xl border p-3 ${item.read ? "border-border bg-muted/40" : "border-primary/30 bg-primary/5"}`}
                            >
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5">{iconByType(item.type)}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                                        <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
