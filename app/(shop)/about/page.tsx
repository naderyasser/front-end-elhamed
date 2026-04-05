import Link from "next/link";

export default function AboutPage() {
    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>
                        من نحن
                    </h1>
                    <p style={{ lineHeight: 1.9 }}>
                        في الحامد نعمل على تقديم منتجات عناية وتجميل بجودة عالية وتجربة شراء مريحة وسريعة.
                        هدفنا أن نمنحك نفس جودة المتجر الأصلي مع واجهة حديثة تعمل بكفاءة على كل الأجهزة.
                    </p>
                    <div className="row g-3 mt-2">
                        <div className="col-md-4">
                            <div className="shop-page-card h-100">
                                <h5>جودة موثوقة</h5>
                                <p className="mb-0">منتجات مختارة بعناية مع متابعة مستمرة لتقييمات العملاء.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="shop-page-card h-100">
                                <h5>شحن سريع</h5>
                                <p className="mb-0">تغطية واسعة داخل مصر مع تحديثات لحالة الطلب لحظة بلحظة.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="shop-page-card h-100">
                                <h5>دعم مستمر</h5>
                                <p className="mb-0">فريق خدمة عملاء متاح للإجابة عن كل استفساراتك قبل وبعد الشراء.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 d-flex gap-2 flex-wrap">
                        <Link href="/shop" className="btn btn-primary">
                            تصفح المنتجات
                        </Link>
                        <a href="https://wa.me/201050188516" className="btn btn-outline-secondary" target="_blank" rel="noreferrer">
                            تواصل واتساب
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
