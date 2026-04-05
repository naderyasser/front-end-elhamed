"use client";
import { useState } from "react";

/* ── Share button (needs client-side navigator API) ── */
export function ShareButton({ productName }: { productName: string }) {
    return (
        <button type="button" className="btn btn-outline-secondary"
            onClick={() => { if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: productName, url: window.location.href }); }}>
            <i className="bx bx-share-alt" /> مشاركة
        </button>
    );
}

/* ── Notify when back in stock ── */
export function NotifyButton({ productId }: { productId: number }) {
    return (
        <form className="d-inline ms-2" onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await fetch(`/api/flask/admin/api/products/${productId}/stock-alert`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: fd.get("email") }),
            });
            alert("سنخبرك عند توفر المنتج!");
        }}>
            <input name="email" type="email" required placeholder="بريدك للإشعار" className="form-control d-inline" style={{ width: 180, display: "inline" }} />
            <button type="submit" className="btn btn-sm btn-outline-primary ms-1"><i className="bx bx-bell" /> أعلمني</button>
        </form>
    );
}

export default function ProductDetailClient({ images, productName }: { images: string[]; productName: string }) {
    const [selected, setSelected] = useState(0);
    const [zoomed, setZoomed] = useState(false);

    return (
        <>
            {/* Main image */}
            <div className="shop-page-card p-2" style={{ background: "var(--lux-surface-2, #f5f5f0)", cursor: "zoom-in", position: "relative" }}
                onClick={() => setZoomed(true)}>
                <img
                    src={images[selected]}
                    alt={productName}
                    className="w-100"
                    style={{ borderRadius: 14, objectFit: "contain", maxHeight: 460, transition: "opacity 0.2s" }}
                />
                <span style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.5)", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem" }}>
                    <i className="bx bx-search-alt" /> اضغط للتكبير
                </span>
            </div>

            {/* Thumbnails */}
            <div className="row g-2 mt-2">
                {images.map((img, index) => (
                    <div key={`${img}-${index}`} className="col-3" style={{ cursor: "pointer" }}
                        onClick={() => setSelected(index)}>
                        <div className="shop-page-card p-2 text-center" style={{
                            border: selected === index ? "2px solid var(--alha-primary, #0071CE)" : "2px solid transparent",
                            borderRadius: 12, transition: "border-color 0.15s",
                        }}>
                            <img src={img} alt={`${productName} ${index + 1}`} className="w-100"
                                style={{ borderRadius: 10, objectFit: "cover", maxHeight: 80 }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Fullscreen zoom modal */}
            {zoomed && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out",
                }} onClick={() => setZoomed(false)}>
                    <button style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 32, cursor: "pointer" }}
                        onClick={() => setZoomed(false)}>
                        <i className="bx bx-x" />
                    </button>
                    {/* Prev/Next */}
                    {images.length > 1 && (
                        <>
                            <button style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 28, borderRadius: "50%", width: 48, height: 48, cursor: "pointer" }}
                                onClick={(e) => { e.stopPropagation(); setSelected(s => (s + 1) % images.length); }}>
                                <i className="bx bx-chevron-right" />
                            </button>
                            <button style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 28, borderRadius: "50%", width: 48, height: 48, cursor: "pointer" }}
                                onClick={(e) => { e.stopPropagation(); setSelected(s => (s - 1 + images.length) % images.length); }}>
                                <i className="bx bx-chevron-left" />
                            </button>
                        </>
                    )}
                    <img src={images[selected]} alt={productName}
                        style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }}
                        onClick={e => e.stopPropagation()} />
                    <div style={{ position: "absolute", bottom: 20, color: "#fff", fontSize: "0.85rem" }}>
                        {selected + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
}
