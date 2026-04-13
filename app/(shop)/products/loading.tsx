/** Shown by Next.js during page transitions to the products route */
export default function ProductsLoading() {
    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                {/* Breadcrumb skeleton */}
                <div className="shop-page-card mb-3 p-3">
                    <div className="sk-line" style={{ width: 220, height: 26 }} />
                    <div className="sk-line mt-2" style={{ width: 160, height: 14 }} />
                </div>

                <div className="row g-3">
                    {/* Sidebar skeleton */}
                    <div className="col-lg-3 order-2 order-lg-1">
                        <div className="shop-page-card mb-3 p-3">
                            <div className="sk-line mb-3" style={{ width: 100, height: 18 }} />
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="sk-line mb-2" style={{ width: `${55 + (i * 7) % 35}%`, height: 15 }} />
                            ))}
                        </div>
                        <div className="shop-page-card mb-3 p-3">
                            <div className="sk-line mb-3" style={{ width: 80, height: 18 }} />
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="sk-line mb-2" style={{ width: `${60 + (i * 9) % 30}%`, height: 15 }} />
                            ))}
                        </div>
                    </div>

                    {/* Products skeleton */}
                    <div className="col-lg-9 order-1 order-lg-2">
                        {/* Sort bar skeleton */}
                        <div className="shop-page-card mb-3 p-3 d-flex align-items-center justify-content-between gap-2">
                            <div className="sk-line" style={{ width: 80, height: 20 }} />
                            <div className="d-flex gap-2">
                                <div className="sk-line" style={{ width: 60, height: 32 }} />
                                <div className="sk-line" style={{ width: 60, height: 32 }} />
                                <div className="sk-line" style={{ width: 120, height: 32 }} />
                                <div className="sk-line" style={{ width: 64, height: 32 }} />
                            </div>
                        </div>

                        {/* Product card skeletons */}
                        <div className="row g-3">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="col-sm-6 col-xl-4">
                                    <div className="product-card-modern product-card-skeleton">
                                        <div className="product-img-wrapper sk-block" />
                                        <div className="product-info-modern">
                                            <div className="sk-line mb-2" style={{ width: "55%", height: 12 }} />
                                            <div className="sk-line mb-1" style={{ width: "100%", height: 16 }} />
                                            <div className="sk-line mb-3" style={{ width: "75%", height: 16 }} />
                                            <div className="sk-line" style={{ width: "45%", height: 22 }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
