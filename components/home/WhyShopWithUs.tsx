type WhyShopItemData = {
    id: number;
    title: string;
    description: string;
    icon: string;
};

type Props = {
    items: WhyShopItemData[];
};

// Default items shown when admin hasn't configured any yet
const DEFAULT_ITEMS: WhyShopItemData[] = [
    { id: 1, title: "شحن سريع", description: "توصيل لجميع أنحاء مصر خلال 24-72 ساعة", icon: "bxs-truck" },
    { id: 2, title: "ضمان الجودة", description: "منتجات أصلية 100% مع ضمان الاسترجاع", icon: "bxs-shield-plus" },
    { id: 3, title: "دعم فني 24/7", description: "فريق خدمة العملاء متاح طوال الأسبوع", icon: "bx-support" },
    { id: 4, title: "دفع آمن", description: "جميع طرق الدفع متاحة وآمنة", icon: "bxs-lock-alt" },
];

export function WhyShopWithUs({ items }: Props) {
    const displayItems = items.length ? items : DEFAULT_ITEMS;

    return (
        <section className="hp-why-shop" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                <div className="hp-section-header justify-content-center text-center mb-4">
                    <h2 className="hp-section-title">
                        <i className="bx bxs-badge-check" style={{ color: "var(--alha-primary)" }} />
                        لماذا تتسوق معنا؟
                    </h2>
                </div>
                <div className="hp-why-grid">
                    {displayItems.map((item, i) => (
                        <div
                            key={item.id}
                            className="hp-why-card"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="hp-why-icon">
                                <i className={`bx ${item.icon}`} />
                            </div>
                            <h3 className="hp-why-title">{item.title}</h3>
                            {item.description && (
                                <p className="hp-why-desc">{item.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
