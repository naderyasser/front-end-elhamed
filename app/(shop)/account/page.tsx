import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";

type MeResponse = {
    authenticated: boolean;
    user: {
        name?: string;
        email?: string;
        phone?: string;
    } | null;
    cart_count: number;
    wishlist_count: number;
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
    const me = await flaskServerJson<MeResponse>("/api/frontend/me");
    const isLoggedIn = Boolean(me?.authenticated);

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>
                        لوحة حسابي
                    </h1>

                    {!isLoggedIn ? (
                        <div className="alert alert-warning mb-4">
                            يجب تسجيل الدخول لعرض بيانات الحساب والطلبات والعناوين.
                            <div className="mt-3 d-flex gap-2 flex-wrap">
                                <Link href="/shop/auth/login" className="btn btn-primary btn-sm">
                                    تسجيل الدخول
                                </Link>
                                <Link href="/shop/auth/register" className="btn btn-outline-primary btn-sm">
                                    إنشاء حساب
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="shop-page-card mb-3" style={{ background: "var(--lux-surface-2, #f5f5f0)" }}>
                            <h6 className="mb-2">مرحبًا، {me?.user?.name || "عميلنا"}</h6>
                            <div className="text-muted" style={{ fontSize: "0.92rem" }}>
                                {me?.user?.email ? <div>{me.user.email}</div> : null}
                                {me?.user?.phone ? <div>{me.user.phone}</div> : null}
                            </div>
                            <div className="d-flex gap-2 mt-3 flex-wrap">
                                <span className="badge text-bg-light border">عناصر السلة: {me?.cart_count ?? 0}</span>
                                <span className="badge text-bg-light border">المفضلة: {me?.wishlist_count ?? 0}</span>
                            </div>
                        </div>
                    )}

                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="shop-page-card h-100">
                                <h6>الطلبات</h6>
                                <p className="text-muted mb-3">تابع حالة طلباتك الحالية والسابقة.</p>
                                <Link href="/shop/orders" className="btn btn-outline-primary btn-sm">
                                    عرض الطلبات
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="shop-page-card h-100">
                                <h6>العناوين</h6>
                                <p className="text-muted mb-3">إدارة عناوين الشحن المفضلة لديك.</p>
                                <Link href="/shop/account/addresses" className="btn btn-outline-primary btn-sm">
                                    إدارة العناوين
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="shop-page-card h-100">
                                <h6>المفضلة</h6>
                                <p className="text-muted mb-3">المنتجات التي قمت بحفظها للشراء لاحقا.</p>
                                <Link href="/shop/wishlist" className="btn btn-outline-primary btn-sm">
                                    فتح المفضلة
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
