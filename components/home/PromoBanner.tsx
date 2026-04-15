import Link from "next/link";

type PromoBannerData = {
    id: number;
    title: string;
    subtitle: string;
    image_url: string;
    cta_text: string;
    cta_link: string;
    background_color: string | null;
    position: string;
};

type Props = {
    banner: PromoBannerData | null;
};

export function PromoBanner({ banner }: Props) {
    if (!banner) return null;

    const bg = banner.background_color || "var(--alha-primary)";
    const hasImage = Boolean(banner.image_url);

    return (
        <section className="hp-promo-banner" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                <div
                    className="hp-promo-inner"
                    style={hasImage ? {} : { background: bg }}
                >
                    {hasImage && (
                        <div className="hp-promo-bg-img">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={banner.image_url} alt={banner.title} loading="lazy" />
                            <div className="hp-promo-overlay" />
                        </div>
                    )}
                    <div className="hp-promo-content">
                        {banner.subtitle && (
                            <p className="hp-promo-subtitle">{banner.subtitle}</p>
                        )}
                        <h2 className="hp-promo-title">{banner.title}</h2>
                        {banner.cta_text && (
                            <Link href={banner.cta_link || "/shop/products"} className="hp-promo-btn">
                                {banner.cta_text} <i className="bx bx-left-arrow-alt" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
