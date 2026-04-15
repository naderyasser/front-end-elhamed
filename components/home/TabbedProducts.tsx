"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";

type ApiProduct = {
    id: number;
    name: string;
    image: string;
    price: number;
    discount: number;
    final_price: number;
    category: string;
};

type Tab = "bestsellers" | "new" | "toprated";

type Props = {
    products: ApiProduct[];
};

const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "bestsellers", label: "الأكثر مبيعاً", icon: "bx-trending-up" },
    { key: "new", label: "وصل حديثاً", icon: "bx-time" },
    { key: "toprated", label: "الأعلى تقييماً", icon: "bx-star" },
];

function sortProducts(products: ApiProduct[], tab: Tab): ApiProduct[] {
    const copy = [...products];
    if (tab === "bestsellers") return copy.sort(() => Math.random() - 0.5);
    if (tab === "new") return copy.sort((a, b) => b.id - a.id);
    if (tab === "toprated") return copy.sort((a, b) => (b.discount - a.discount));
    return copy;
}

export function TabbedProducts({ products }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("bestsellers");

    if (!products.length) return null;

    const displayed = sortProducts(products, activeTab).slice(0, 8);

    return (
        <section className="hp-tabbed" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                <div className="hp-tabbed-header">
                    <div className="hp-tab-pills">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`hp-tab-pill${activeTab === tab.key ? " active" : ""}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <i className={`bx ${tab.icon}`} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <Link href="/shop/products" className="hp-viewall-link d-none d-md-flex">
                        عرض الكل <i className="bx bx-left-arrow-alt" />
                    </Link>
                </div>

                <div className="row g-3 hp-tabbed-grid">
                    {displayed.map((product) => (
                        <div key={product.id} className="col-6 col-md-4 col-lg-3">
                            <Link href={`/shop/products/${product.id}`} className="hp-tabbed-card d-block">
                                <div className="hp-tabbed-img">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={formatStoreImage(product.image)} alt={product.name} loading="lazy" />
                                    {product.discount > 0 && (
                                        <span className="hp-tabbed-badge">-{product.discount}%</span>
                                    )}
                                </div>
                                <div className="hp-tabbed-info">
                                    <p className="hp-tabbed-cat">{product.category}</p>
                                    <p className="hp-tabbed-name">{product.name}</p>
                                    <div className="hp-tabbed-prices">
                                        <span className="hp-tabbed-price">{formatMoneyEGP(product.final_price)}</span>
                                        {product.discount > 0 && (
                                            <span className="hp-tabbed-orig">{formatMoneyEGP(product.price)}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-3 d-md-none">
                    <Link href="/shop/products" className="hp-viewall-link">
                        عرض الكل <i className="bx bx-left-arrow-alt" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
