type TrustBadgeData = {
    id: number;
    name: string;
    image_url: string;
};

type Props = {
    badges: TrustBadgeData[];
};

// Static fallback payment/trust badges
const FALLBACK_BADGES = [
    { id: 1, name: "Visa", image_url: "" },
    { id: 2, name: "Mastercard", image_url: "" },
    { id: 3, name: "Fawry", image_url: "" },
    { id: 4, name: "InstaPay", image_url: "" },
];

export function TrustBar({ badges }: Props) {
    const displayBadges = badges.length ? badges : FALLBACK_BADGES;

    return (
        <section className="hp-trust-bar" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                <div className="hp-trust-bar-inner">
                    <span className="hp-trust-bar-label">
                        <i className="bx bxs-lock-alt" /> وسائل الدفع المقبولة
                    </span>
                    <div className="hp-trust-bar-badges">
                        {displayBadges.map((badge) =>
                            badge.image_url ? (
                                <div key={badge.id} className="hp-trust-badge">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={badge.image_url} alt={badge.name} loading="lazy" />
                                </div>
                            ) : (
                                <div key={badge.id} className="hp-trust-badge hp-trust-badge-text">
                                    {badge.name}
                                </div>
                            )
                        )}
                    </div>
                    <div className="hp-trust-bar-secure">
                        <i className="bx bxs-shield-plus text-success" />
                        <span>موقع محمي بالكامل</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
