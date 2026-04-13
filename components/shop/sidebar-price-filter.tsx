"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
    minPrice: number;
    maxPrice: number;
    absMin?: number;
    absMax?: number;
};

const PRESETS = [
    { label: "أقل من 500", min: 0, max: 500 },
    { label: "500 – 2000", min: 500, max: 2000 },
    { label: "2000 – 8000", min: 2000, max: 8000 },
    { label: "أكثر من 8000", min: 8000, max: 0 },
];

export function SidebarPriceFilter({ minPrice, maxPrice, absMin = 50, absMax = 30000 }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [localMin, setLocalMin] = useState(minPrice > 0 ? String(minPrice) : "");
    const [localMax, setLocalMax] = useState(maxPrice > 0 ? String(maxPrice) : "");
    const [focusedField, setFocusedField] = useState<"min" | "max" | null>(null);

    function navigate(min: string, max: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        if (min) params.set("min", min); else params.delete("min");
        if (max) params.set("max", max); else params.delete("max");
        router.push(`/shop/products?${params.toString()}`, { scroll: false });
    }

    function apply() {
        navigate(localMin, localMax);
    }

    function applyPreset(min: number, max: number) {
        const sMin = min > 0 ? String(min) : "";
        const sMax = max > 0 ? String(max) : "";
        setLocalMin(sMin);
        setLocalMax(sMax);
        navigate(sMin, sMax);
    }

    function clear() {
        setLocalMin("");
        setLocalMax("");
        navigate("", "");
    }

    const isActive = minPrice > 0 || maxPrice > 0;

    // Visual track: percentage-based fill
    const trackMin = localMin ? Math.max(0, Math.min(100, ((Number(localMin) - absMin) / (absMax - absMin)) * 100)) : 0;
    const trackMax = localMax ? Math.max(0, Math.min(100, ((Number(localMax) - absMin) / (absMax - absMin)) * 100)) : 100;

    return (
        <aside className="shop-page-card mb-3" style={{ padding: "1.1rem" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.9rem" }}>
                <span style={{ fontWeight: 800, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: 6, color: "var(--lux-text, #1a1a1a)" }}>
                    <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: "var(--alha-primary, #0071ce)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: "0.85rem", flexShrink: 0,
                    }}>
                        <i className="bx bx-shekel" />
                    </span>
                    نطاق السعر
                </span>
                {isActive && (
                    <button
                        type="button"
                        onClick={clear}
                        style={{
                            background: "none", border: "none", padding: "2px 8px",
                            fontSize: "0.75rem", cursor: "pointer", borderRadius: 20,
                            color: "#e53935", fontWeight: 600,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(229,57,53,0.08)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                        مسح ✕
                    </button>
                )}
            </div>

            {/* Visual range track */}
            <div style={{ marginBottom: "0.85rem", padding: "0 2px" }}>
                <div style={{
                    height: 4, borderRadius: 4,
                    background: "var(--lux-border, #e0e0da)",
                    position: "relative", overflow: "visible",
                }}>
                    <div style={{
                        position: "absolute",
                        left: `${trackMin}%`,
                        right: `${100 - trackMax}%`,
                        height: "100%",
                        background: "var(--alha-primary, #0071ce)",
                        borderRadius: 4,
                        transition: "left 0.2s, right 0.2s",
                    }} />
                    {/* Thumb dots */}
                    <div style={{
                        position: "absolute",
                        left: `${trackMin}%`,
                        top: "50%", transform: "translate(-50%, -50%)",
                        width: 10, height: 10, borderRadius: "50%",
                        background: (localMin && trackMin > 0) ? "var(--alha-primary, #0071ce)" : "var(--lux-border, #e0e0da)",
                        border: "2px solid #fff",
                        boxShadow: "0 0 0 1.5px var(--alha-primary, #0071ce)",
                        transition: "left 0.2s",
                    }} />
                    <div style={{
                        position: "absolute",
                        left: `${trackMax}%`,
                        top: "50%", transform: "translate(-50%, -50%)",
                        width: 10, height: 10, borderRadius: "50%",
                        background: (localMax && trackMax < 100) ? "var(--alha-primary, #0071ce)" : "var(--lux-border, #e0e0da)",
                        border: "2px solid #fff",
                        boxShadow: "0 0 0 1.5px var(--alha-primary, #0071ce)",
                        transition: "left 0.2s",
                    }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.68rem", color: "var(--lux-text-secondary, #999)" }}>
                    <span>{absMin.toLocaleString("ar-EG")}</span>
                    <span>{absMax.toLocaleString("ar-EG")} ج.م</span>
                </div>
            </div>

            {/* Inputs */}
            <div style={{ display: "flex", gap: 8, marginBottom: "0.85rem" }}>
                {(["min", "max"] as const).map((field) => (
                    <div key={field} style={{ flex: 1, position: "relative" }}>
                        <label style={{
                            position: "absolute", top: focusedField === field || (field === "min" ? !!localMin : !!localMax) ? -10 : 9,
                            right: 8, fontSize: focusedField === field || (field === "min" ? !!localMin : !!localMax) ? "0.65rem" : "0.75rem",
                            color: focusedField === field ? "var(--alha-primary, #0071ce)" : "var(--lux-text-secondary, #999)",
                            transition: "all 0.15s", pointerEvents: "none", background: "var(--lux-surface, #fff)",
                            padding: "0 3px", fontWeight: 500, lineHeight: 1,
                        }}>
                            {field === "min" ? "من" : "إلى"}
                        </label>
                        <input
                            type="number"
                            value={field === "min" ? localMin : localMax}
                            onChange={e => field === "min" ? setLocalMin(e.target.value) : setLocalMax(e.target.value)}
                            onFocus={() => setFocusedField(field)}
                            onBlur={() => setFocusedField(null)}
                            onKeyDown={e => e.key === "Enter" && apply()}
                            min={absMin}
                            max={absMax}
                            aria-label={field === "min" ? "أقل سعر" : "أعلى سعر"}
                            style={{
                                width: "100%", padding: "10px 8px 6px",
                                border: `1.5px solid ${focusedField === field ? "var(--alha-primary, #0071ce)" : "var(--lux-border, #e0e0da)"}`,
                                borderRadius: 10, background: "var(--lux-surface, #fff)",
                                color: "var(--lux-text, #1a1a1a)", fontSize: "0.88rem",
                                outline: "none", transition: "border-color 0.15s",
                                appearance: "textfield", MozAppearance: "textfield",
                                WebkitAppearance: "none",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Active label */}
            {isActive && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "5px 10px", borderRadius: 20, marginBottom: "0.75rem",
                    background: "rgba(0,113,206,0.08)", width: "fit-content",
                    fontSize: "0.78rem", color: "var(--alha-primary, #0071ce)", fontWeight: 600,
                }}>
                    <i className="bx bx-filter-alt" style={{ fontSize: "0.85rem" }} />
                    {minPrice > 0 ? `${minPrice.toLocaleString("ar-EG")}` : absMin.toLocaleString("ar-EG")}
                    {" — "}
                    {maxPrice > 0 ? `${maxPrice.toLocaleString("ar-EG")}` : "∞"}
                    {" ج.م"}
                </div>
            )}

            {/* Apply button */}
            <button
                type="button"
                onClick={apply}
                style={{
                    width: "100%", padding: "9px 0",
                    background: "var(--alha-primary, #0071ce)",
                    color: "#fff", border: "none", borderRadius: 10,
                    fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
                    transition: "background 0.15s, transform 0.1s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    marginBottom: "0.85rem",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--alha-primary-dark, #004c91)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--alha-primary, #0071ce)")}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            >
                <i className="bx bx-search-alt" />
                عرض النتائج
            </button>

            {/* Preset chips */}
            <div style={{ borderTop: "1px solid var(--lux-border, #e0e0da)", paddingTop: "0.75rem" }}>
                <p style={{ fontSize: "0.72rem", color: "var(--lux-text-secondary, #999)", margin: "0 0 6px", fontWeight: 600 }}>
                    اختيار سريع
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {PRESETS.map((p) => {
                        const active = minPrice === p.min && maxPrice === p.max;
                        return (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => applyPreset(p.min, p.max)}
                                style={{
                                    padding: "3px 10px", borderRadius: 20, fontSize: "0.73rem",
                                    fontWeight: active ? 700 : 500, cursor: "pointer",
                                    border: `1.5px solid ${active ? "var(--alha-primary, #0071ce)" : "var(--lux-border, #e0e0da)"}`,
                                    background: active ? "rgba(0,113,206,0.1)" : "transparent",
                                    color: active ? "var(--alha-primary, #0071ce)" : "var(--lux-text, #1a1a1a)",
                                    transition: "all 0.15s",
                                }}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
