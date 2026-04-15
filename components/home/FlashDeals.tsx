"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";

type FlashDeal = {
    id: number;
    product_id: number;
    name: string;
    image: string;
    deal_price: number;
    original_price: number;
    discount_percent: number;
    percent_claimed: number;
    stock_total: number;
    stock_sold: number;
    ends_at: string | null;
};

type Props = {
    deals: FlashDeal[];
};

function useCountdown(targetIso: string | null) {
    function calc() {
        if (!targetIso) return { h: 0, m: 0, s: 0, done: true };
        const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return { h, m, s, done: diff === 0 };
    }
    const [time, setTime] = useState(calc);
    useEffect(() => {
        if (!targetIso) return;
        const t = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetIso]);
    return time;
}

function Pad({ n }: { n: number }) {
    return <span>{String(n).padStart(2, "0")}</span>;
}

export function FlashDeals({ deals }: Props) {
    // Use the earliest ending deal for the countdown
    const soonest = deals.reduce<string | null>((acc, d) => {
        if (!d.ends_at) return acc;
        if (!acc || d.ends_at < acc) return d.ends_at;
        return acc;
    }, null);
    const countdown = useCountdown(soonest);

    if (!deals.length) return null;

    return (
        <section className="hp-flash-v2" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                <div className="hp-flash-v2-header">
                    <div className="hp-flash-v2-title-wrap">
                        <span className="hp-flash-v2-badge">
                            <i className="bx bxs-zap" /> عروض خاطفة
                        </span>
                        {soonest && !countdown.done && (
                            <div className="hp-flash-v2-countdown" aria-label="الوقت المتبقي">
                                <span className="hp-flash-countdown-label">ينتهي خلال</span>
                                <div className="hp-flash-countdown-timer">
                                    <div className="hp-flash-countdown-unit">
                                        <Pad n={countdown.h} />
                                        <span>س</span>
                                    </div>
                                    <span className="hp-flash-countdown-sep">:</span>
                                    <div className="hp-flash-countdown-unit">
                                        <Pad n={countdown.m} />
                                        <span>د</span>
                                    </div>
                                    <span className="hp-flash-countdown-sep">:</span>
                                    <div className="hp-flash-countdown-unit">
                                        <Pad n={countdown.s} />
                                        <span>ث</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Link href="/shop/products?sort=discount" className="hp-viewall-link">
                        عرض الكل <i className="bx bx-left-arrow-alt" />
                    </Link>
                </div>

                <div className="row g-3">
                    {deals.slice(0, 6).map((deal) => (
                        <div key={deal.id} className="col-6 col-lg-3 col-xl-2">
                            <Link href={`/shop/products/${deal.product_id}`} className="hp-flash-card-v2 d-block h-100">
                                <div className="hp-flash-card-img">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={formatStoreImage(deal.image)} alt={deal.name} loading="lazy" />
                                    {deal.discount_percent > 0 && (
                                        <span className="hp-flash-discount-chip">-{deal.discount_percent}%</span>
                                    )}
                                </div>
                                <div className="hp-flash-card-body">
                                    <p className="hp-flash-card-name">{deal.name}</p>
                                    <div className="hp-flash-card-prices">
                                        <span className="hp-flash-deal-price">{formatMoneyEGP(deal.deal_price)}</span>
                                        {deal.discount_percent > 0 && (
                                            <span className="hp-flash-orig-price">{formatMoneyEGP(deal.original_price)}</span>
                                        )}
                                    </div>
                                    {/* Progress bar */}
                                    <div className="hp-flash-progress-wrap">
                                        <div className="hp-flash-progress-bar">
                                            <div
                                                className="hp-flash-progress-fill"
                                                style={{ width: `${deal.percent_claimed}%` }}
                                            />
                                        </div>
                                        <span className="hp-flash-progress-label">
                                            {deal.percent_claimed}% تم بيعه
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
