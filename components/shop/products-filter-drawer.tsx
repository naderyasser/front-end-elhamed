"use client";

import { useState, useEffect } from "react";

type Props = {
    children: React.ReactNode;
    activeCount: number;
};

/**
 * Wraps the sidebar filter content.
 * – Desktop (lg+): renders children inline as a normal sidebar column.
 * – Mobile:        hides children off-screen; "openFilterDrawer" custom event slides them in.
 */
export function ProductsFilterDrawer({ children, activeCount }: Props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function handleOpen() { setOpen(true); }
        window.addEventListener("openFilterDrawer", handleOpen);
        return () => window.removeEventListener("openFilterDrawer", handleOpen);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <>
            {/* Overlay — mobile only */}
            <div
                className={`filter-drawer-overlay${open ? " open" : ""}`}
                onClick={() => setOpen(false)}
            />

            {/* Sidebar — inline on desktop, slide-in drawer on mobile */}
            <div className={`products-filter-sidebar${open ? " drawer-open" : ""}`}>
                {/* Drawer header (mobile only) */}
                <div className="filter-drawer-header d-lg-none">
                    <span className="filter-drawer-title">
                        <i className="bx bx-slider-alt" /> الفلاتر
                        {activeCount > 0 && (
                            <span className="filter-drawer-badge">{activeCount}</span>
                        )}
                    </span>
                    <button
                        type="button"
                        className="filter-drawer-close"
                        onClick={() => setOpen(false)}
                        aria-label="إغلاق"
                    >
                        <i className="bx bx-x" />
                    </button>
                </div>

                {/* Sidebar content */}
                <div className="filter-drawer-body">
                    {children}
                </div>

                {/* Apply button footer (mobile only) */}
                <div className="filter-drawer-footer d-lg-none">
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => setOpen(false)}
                    >
                        <i className="bx bx-check" /> تطبيق الفلاتر
                    </button>
                </div>
            </div>
        </>
    );
}

/** Trigger button rendered in the products column (mobile only) */
export function FilterDrawerTrigger({ activeCount, total }: { activeCount: number; total: number }) {
    return (
        <div className="d-flex d-lg-none align-items-center justify-content-between mb-3">
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                <i className="bx bx-package" style={{ marginLeft: 4 }} />
                {total} منتج
            </span>
            <button
                type="button"
                className="filter-trigger-btn"
                onClick={() => window.dispatchEvent(new Event("openFilterDrawer"))}
            >
                <i className="bx bx-slider-alt" />
                <span>الفلاتر</span>
                {activeCount > 0 && (
                    <span className="filter-trigger-badge">{activeCount}</span>
                )}
            </button>
        </div>
    );
}
