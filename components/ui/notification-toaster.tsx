"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleCheckBig, Info, TriangleAlert, X } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";

function toneClass(type: "info" | "success" | "warning") {
    if (type === "success") return "border-success/30 bg-success/10";
    if (type === "warning") return "border-warning/30 bg-warning/10";
    return "border-secondary/30 bg-secondary/10";
}

function toneIcon(type: "info" | "success" | "warning") {
    if (type === "success") return <CircleCheckBig className="h-4 w-4 text-success" />;
    if (type === "warning") return <TriangleAlert className="h-4 w-4 text-warning" />;
    return <Info className="h-4 w-4 text-secondary" />;
}

export function NotificationToaster() {
    const { toasts, dismissToast } = useNotifications();

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[70] space-y-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className={`pointer-events-auto w-[320px] max-w-[90vw] rounded-xl border p-3 shadow-md ${toneClass(toast.type)}`}
                    >
                        <div className="flex items-start gap-2">
                            {toneIcon(toast.type)}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground">{toast.title}</p>
                                <p className="text-xs text-muted-foreground">{toast.description}</p>
                            </div>
                            <button
                                aria-label="Dismiss toast"
                                onClick={() => dismissToast(toast.id)}
                                className="interactive ripple rounded-md p-1 text-muted-foreground hover:bg-muted"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
