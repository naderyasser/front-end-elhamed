"use client";

import dynamic from "next/dynamic";

// Lazy load footer logo section with SSR disabled to prevent hydration errors
export function FooterLogo() {
    return (
        <>
            <img
                src="/static/images/logo-alha.jpeg"
                alt="شعار الحمد"
                className="footer-logo"
                width={140}
                height={140}
            />
            <p className="footer-description">
                مرحباً بكم في الحمد، وجهتكم المثالية للمنتجات الفاخرة والعناية بالجمال.
            </p>
            <div className="footer-social-icons">
                <a href="https://www.facebook.com/share/1HBiHzhNp9/" target="_blank" rel="noreferrer" className="footer-social-link">
                    <i className="bx bxl-facebook" />
                </a>
                <a href="https://wa.me/201050188516" target="_blank" rel="noreferrer" className="footer-social-link">
                    <i className="bx bxl-whatsapp" />
                </a>
                <a href="tel:+201050188516" className="footer-social-link">
                    <i className="bx bx-phone" />
                </a>
            </div>
        </>
    );
}