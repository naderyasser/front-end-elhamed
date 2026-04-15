"use client";

import { useState } from "react";

type NewsletterConfigData = {
    title: string;
    subtitle: string;
    button_text: string;
    background_image: string | null;
};

type Props = {
    config: NewsletterConfigData | null;
};

const DEFAULT_CONFIG: NewsletterConfigData = {
    title: "اشترك في نشرتنا البريدية",
    subtitle: "احصل على أحدث العروض والمنتجات الجديدة مباشرة في بريدك الإلكتروني",
    button_text: "اشترك الآن",
    background_image: null,
};

export function NewsletterBanner({ config }: Props) {
    const cfg = config || DEFAULT_CONFIG;
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.includes("@")) {
            setError("أدخل بريد إلكتروني صحيح");
            return;
        }
        setSubmitted(true);
        setError("");
    }

    return (
        <section className="hp-newsletter" dir="rtl">
            {cfg.background_image && (
                <div className="hp-newsletter-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cfg.background_image} alt="" loading="lazy" />
                    <div className="hp-newsletter-overlay" />
                </div>
            )}
            <div className="container-fluid px-3 px-lg-4 position-relative" style={{ zIndex: 2 }}>
                <div className="hp-newsletter-content">
                    <div className="hp-newsletter-icon">
                        <i className="bx bx-envelope" />
                    </div>
                    <h2 className="hp-newsletter-title">{cfg.title}</h2>
                    <p className="hp-newsletter-subtitle">{cfg.subtitle}</p>

                    {submitted ? (
                        <div className="hp-newsletter-success">
                            <i className="bx bx-check-circle" />
                            <span>شكراً! تم تسجيلك بنجاح.</span>
                        </div>
                    ) : (
                        <form className="hp-newsletter-form" onSubmit={handleSubmit}>
                            <div className="hp-newsletter-input-wrap">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="بريدك الإلكتروني..."
                                    className="hp-newsletter-input"
                                    required
                                />
                                <button type="submit" className="hp-newsletter-btn">
                                    {cfg.button_text}
                                </button>
                            </div>
                            {error && <p className="hp-newsletter-error">{error}</p>}
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
