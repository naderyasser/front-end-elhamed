"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, trickleSpeed: 140, minimum: 0.18 });

export function TopProgress() {
    const pathname = usePathname();

    useEffect(() => {
        NProgress.done();
    }, [pathname]);

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const link = target?.closest("a[href]") as HTMLAnchorElement | null;
            if (!link) return;
            if (link.target === "_blank") return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (link.href.startsWith(window.location.origin)) {
                NProgress.start();
            }
        };

        window.addEventListener("click", onClick, true);
        return () => {
            window.removeEventListener("click", onClick, true);
        };
    }, []);

    return null;
}
