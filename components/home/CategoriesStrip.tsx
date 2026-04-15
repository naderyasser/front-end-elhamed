"use client";

import { useRef } from "react";
import Link from "next/link";
import { formatStoreImage } from "@/lib/store-utils";

type CategoryNode = {
    id: number;
    name: string;
    icon: string | null;
    image: string | null;
};

type Props = {
    categories: CategoryNode[];
};

export function CategoriesStrip({ categories }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    function scrollLeft() {
        scrollRef.current?.scrollBy({ left: -240, behavior: "smooth" });
    }
    function scrollRight() {
        scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" });
    }

    return (
        <section className="hp-categories-section" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                <div className="hp-section-header">
                    <h2 className="hp-section-title">
                        <i className="bx bx-grid-alt" style={{ color: "var(--alha-primary)" }} />
                        تصفح الأقسام
                    </h2>
                    <div className="hp-scroll-arrows d-none d-lg-flex">
                        <button className="hp-scroll-arrow" onClick={scrollLeft} aria-label="يمين">
                            <i className="bx bx-chevron-right" />
                        </button>
                        <button className="hp-scroll-arrow" onClick={scrollRight} aria-label="يسار">
                            <i className="bx bx-chevron-left" />
                        </button>
                    </div>
                </div>
                <div className="hp-cat-scroll-v2" ref={scrollRef}>
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop/products?category=${encodeURIComponent(cat.name)}`}
                            className="hp-cat-card-v2"
                        >
                            <div className="hp-cat-card-icon">
                                {cat.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={formatStoreImage(cat.image)} alt={cat.name} loading="lazy" />
                                ) : (
                                    <i className={`bx ${cat.icon ? `bx-${cat.icon}` : "bx-category"}`} />
                                )}
                            </div>
                            <span className="hp-cat-card-name">{cat.name}</span>
                        </Link>
                    ))}
                    <Link href="/shop/products" className="hp-cat-card-v2 hp-cat-card-viewall">
                        <div className="hp-cat-card-icon">
                            <i className="bx bx-grid-alt" />
                        </div>
                        <span className="hp-cat-card-name">عرض الكل</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
