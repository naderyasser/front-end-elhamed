import Link from "next/link";

export default function PaymentPage() {
    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container" style={{ maxWidth: 800 }}>
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>
                        خيارات الدفع
                    </h1>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="shop-page-card h-100 text-center">
                                <i className="bx bx-credit-card" style={{ fontSize: 28 }} />
                                <h6 className="mt-2">بطاقة بنكية</h6>
                                <p className="mb-0 text-muted">فيزا / ماستركارد</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="shop-page-card h-100 text-center">
                                <i className="bx bx-wallet" style={{ fontSize: 28 }} />
                                <h6 className="mt-2">محفظة إلكترونية</h6>
                                <p className="mb-0 text-muted">فودافون كاش وغير ذلك</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="shop-page-card h-100 text-center">
                                <i className="bx bx-money" style={{ fontSize: 28 }} />
                                <h6 className="mt-2">الدفع عند الاستلام</h6>
                                <p className="mb-0 text-muted">متاح في معظم المحافظات</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 d-flex gap-2">
                        <Link href="/shop/checkout" className="btn btn-primary">
                            الرجوع لإتمام الطلب
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
