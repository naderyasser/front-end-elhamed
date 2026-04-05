const faqs = [
    {
        q: "ما هي مدة الشحن داخل مصر؟",
        a: "غالبًا من 2 إلى 5 أيام عمل حسب المحافظة وشركة الشحن.",
    },
    {
        q: "هل يمكن استرجاع المنتج؟",
        a: "نعم، يمكنك الاسترجاع خلال 14 يومًا وفق سياسة الاسترجاع.",
    },
    {
        q: "ما طرق الدفع المتاحة؟",
        a: "الدفع عند الاستلام، بطاقات بنكية، ومحافظ إلكترونية حسب التوفر.",
    },
    {
        q: "كيف أتتبع طلبي؟",
        a: "من صفحة طلباتي أو باستخدام رقم الطلب من صفحة تتبع الطلب.",
    },
];

export default function ShopFaqPage() {
    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container" style={{ maxWidth: 900 }}>
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>الأسئلة الشائعة</h1>
                    <div className="accordion" id="faqAccordion">
                        {faqs.map((faq, index) => {
                            const headingId = `faq-heading-${index}`;
                            const collapseId = `faq-collapse-${index}`;
                            return (
                                <div className="accordion-item" key={faq.q}>
                                    <h2 className="accordion-header" id={headingId}>
                                        <button
                                            className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#${collapseId}`}
                                            aria-expanded={index === 0 ? "true" : "false"}
                                            aria-controls={collapseId}
                                        >
                                            {faq.q}
                                        </button>
                                    </h2>
                                    <div
                                        id={collapseId}
                                        className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                        aria-labelledby={headingId}
                                        data-bs-parent="#faqAccordion"
                                    >
                                        <div className="accordion-body">{faq.a}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
