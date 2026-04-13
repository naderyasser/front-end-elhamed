"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageTransitionLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [visible, setVisible] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const minDisplayMs = 350;
    const shownAt = useRef<number>(0);

    // Build a full route key that changes on both pathname AND query changes
    const routeKey = `${pathname}?${searchParams.toString()}`;

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (e.defaultPrevented) return;
            if (e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const target = (e.target as HTMLElement | null)?.closest?.("a");
            if (!target) return;
            const anchor = target as HTMLAnchorElement;
            const href = anchor.getAttribute("href") || "";
            if (!href || href.startsWith("#")) return;
            if (anchor.target && anchor.target !== "_self") return;
            if (anchor.hasAttribute("download")) return;

            try {
                const url = new URL(anchor.href, window.location.href);
                if (url.origin !== window.location.origin) return;
                // Skip if navigating to the exact same URL (pathname + search)
                if (url.pathname === window.location.pathname && url.search === window.location.search) return;
            } catch {
                return;
            }

            setVisible(true);
            shownAt.current = Date.now();
        }

        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);

    useEffect(() => {
        if (!visible) return;
        const elapsed = Date.now() - shownAt.current;
        const wait = Math.max(minDisplayMs - elapsed, 200);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setVisible(false), wait);
        return () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeKey]);

    if (!visible) return null;

    return (
        <div
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(10, 10, 10, 0.45)",
                backdropFilter: "blur(3px)",
                WebkitBackdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2147483000,
                animation: "alhamd-fade-in 0.25s ease-out",
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: "4px solid rgba(255, 255, 255, 0.25)",
                    borderTopColor: "#ff9900",
                    animation: "alhamd-spin 0.9s linear infinite",
                }}
            />
            <style>{`
                @keyframes alhamd-spin { to { transform: rotate(360deg); } }
                @keyframes alhamd-fade-in { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
