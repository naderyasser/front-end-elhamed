"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {
    total: number;
    sort: string;
    minPrice: number;
    maxPrice: number;
};

/**
 * Sticky sort/filter bar above the products grid.
 * – Sort: auto-navigates on select change via router.push (no reload)
 * – Price range: two inputs; apply on blur or Enter
 * – View toggle: grid / list — persisted in localStorage, applied via data-view attr
 */
export function ProductsSortBar({ total, sort, minPrice, maxPrice }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [view, setView] = useState<"grid" | "list">("grid");
    const [localMin, setLocalMin] = useState(minPrice > 0 ? String(minPrice) : "");
    const [localMax, setLocalMax] = useState(maxPrice > 0 ? String(maxPrice) : "");

    useEffect(() => {
        const stored = (localStorage.getItem("products-view") as "grid" | "list") || "grid";
        setView(stored);
        applyView(stored);
    }, []);

    function applyView(v: "grid" | "list") {
        const grid = document.getElementById("products-grid");
        if (grid) grid.dataset.view = v;
    }

    function navigate(updates: Record<string, string | undefined>) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        Object.entries(updates).forEach(([k, v]) => {
            if (v !== undefined && v !== "") params.set(k, v);
            else params.delete(k);
        });
        router.push(`/shop/products?${params.toString()}`, { scroll: false });
    }

    function handlePriceApply() {
        navigate({ min: localMin || undefined, max: localMax || undefined });
    }

    function handleViewToggle(v: "grid" | "list") {
        setView(v);
        localStorage.setItem("products-view", v);
        applyView(v);
    }

    return (
        <div className="products-sort-bar">
            {/* Product count */}
            <span className="sort-bar-count">
                <i className="bx bx-package" />
                {total} منتج
            </span>

            <div className="sort-bar-controls">
                {/* Price range */}
                <div className="price-range-group">
                    <input
                        type="number"
                        className="price-range-input"
                        placeholder="من"
                        value={localMin}
                        onChange={e => setLocalMin(e.target.value)}
                        onBlur={handlePriceApply}
                        onKeyDown={e => e.key === "Enter" && handlePriceApply()}
                        min={0}
                        aria-label="أقل سعر"
                    />
                    <span className="price-range-sep">—</span>
                    <input
                        type="number"
                        className="price-range-input"
                        placeholder="إلى"
                        value={localMax}
                        onChange={e => setLocalMax(e.target.value)}
                        onBlur={handlePriceApply}
                        onKeyDown={e => e.key === "Enter" && handlePriceApply()}
                        min={0}
                        aria-label="أعلى سعر"
                    />
                    <button
                        type="button"
                        className="price-range-apply"
                        onClick={handlePriceApply}
                        title="تطبيق نطاق السعر"
                    >
                        <i className="bx bx-check" />
                    </button>
                </div>

                {/* Sort select */}
                <select
                    value={sort}
                    onChange={e => navigate({ sort: e.target.value })}
                    className="sort-select"
                    aria-label="ترتيب المنتجات"
                >
                    <option value="newest">الأحدث</option>
                    <option value="discount">الأكثر خصمًا</option>
                    <option value="rating">الأعلى تقييمًا</option>
                    <option value="price_asc">السعر ↑</option>
                    <option value="price_desc">السعر ↓</option>
                </select>

                {/* Grid / List toggle */}
                <div className="view-toggle-group" role="group" aria-label="طريقة العرض">
                    <button
                        type="button"
                        className={`view-toggle-btn${view === "grid" ? " active" : ""}`}
                        onClick={() => handleViewToggle("grid")}
                        title="عرض شبكة"
                        aria-pressed={view === "grid"}
                    >
                        <i className="bx bx-grid-alt" />
                    </button>
                    <button
                        type="button"
                        className={`view-toggle-btn${view === "list" ? " active" : ""}`}
                        onClick={() => handleViewToggle("list")}
                        title="عرض قائمة"
                        aria-pressed={view === "list"}
                    >
                        <i className="bx bx-list-ul" />
                    </button>
                </div>
            </div>
        </div>
    );
}
