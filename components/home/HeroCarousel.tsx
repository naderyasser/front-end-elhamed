"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type BannerSlide = {
    id: number;
    image_url: string;
    title: string;
    subtitle: string;
    description: string;
    link_url: string;
};

type Props = {
    banners: BannerSlide[];
};

export function HeroCarousel({ banners }: Props) {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number | null>(null);

    const count = banners.length;

    function goTo(index: number) {
        if (isAnimating || count <= 1) return;
        setIsAnimating(true);
        setCurrent(((index % count) + count) % count);
        setTimeout(() => setIsAnimating(false), 600);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function resetTimer() {
        if (timerRef.current) clearInterval(timerRef.current);
        if (count > 1) {
            timerRef.current = setInterval(next, 5000);
        }
    }

    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, count]);

    function handleTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
    }
    function handleTouchEnd(e: React.TouchEvent) {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) next(); else prev();
            resetTimer();
        }
        touchStartX.current = null;
    }

    if (!banners.length) return null;
    const slide = banners[current];

    return (
        <div
            className="hp-hero-carousel"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            dir="rtl"
        >
            {/* Slides */}
            {banners.map((b, i) => (
                <div
                    key={b.id}
                    className={`hp-carousel-slide${i === current ? " active" : ""}${isAnimating && i === current ? " entering" : ""}`}
                    aria-hidden={i !== current}
                >
                    {/* Background image */}
                    <div className="hp-carousel-bg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.image_url || "/static/images/banner-image2.jpg"} alt={b.title} fetchPriority={i === 0 ? "high" : "auto"} />
                        <div className="hp-carousel-overlay" />
                    </div>

                    {/* Content */}
                    <div className="container h-100 position-relative" style={{ zIndex: 2 }}>
                        <div className="row h-100 align-items-center">
                            <div className="col-lg-6">
                                <div className={`hp-carousel-content${i === current ? " visible" : ""}`}>
                                    {b.subtitle && (
                                        <p className="hp-carousel-subtitle">{b.subtitle}</p>
                                    )}
                                    <h2 className="hp-carousel-title">{b.title || "متجر الحمد"}</h2>
                                    {b.description && (
                                        <p className="hp-carousel-desc">{b.description}</p>
                                    )}
                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        <Link
                                            href={b.link_url || "/shop/products"}
                                            className="hp-carousel-btn-primary"
                                        >
                                            تسوق الآن <i className="bx bx-left-arrow-alt" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Arrows */}
            {count > 1 && (
                <>
                    <button
                        className="hp-carousel-arrow hp-carousel-arrow-next"
                        onClick={() => { next(); resetTimer(); }}
                        aria-label="التالي"
                    >
                        <i className="bx bx-chevron-right" />
                    </button>
                    <button
                        className="hp-carousel-arrow hp-carousel-arrow-prev"
                        onClick={() => { prev(); resetTimer(); }}
                        aria-label="السابق"
                    >
                        <i className="bx bx-chevron-left" />
                    </button>
                </>
            )}

            {/* Dots */}
            {count > 1 && (
                <div className="hp-carousel-dots">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            className={`hp-carousel-dot${i === current ? " active" : ""}`}
                            onClick={() => { goTo(i); resetTimer(); }}
                            aria-label={`الشريحة ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
