"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoneyEGP } from "@/lib/store-utils";
import { useCart } from "@/contexts/CartContext";

type City = {
    id: number;
    name: string;
    city_id: string;
};

type Zone = {
    id: number;
    name: string;
    zone_id: string;
};

type CitiesResponse = {
    city: City[];
};

type ZonesResponse = {
    zones: Zone[];
};

export default function CheckoutPageClient() {
    const router = useRouter();
    const { cart, isMounted, refreshCart } = useCart();
    const [cities, setCities] = useState<City[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedZone, setSelectedZone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitError("");
        setSubmitting(true);
        try {
            const formData = new FormData(event.currentTarget);
            const res = await fetch("/api/flask/checkout/place_order", {
                method: "POST",
                body: formData,
                credentials: "include",
                redirect: "follow",
            });
            // Flask redirects on success to /order_confirmation?order_id=...
            // Extract order id from the final URL if available.
            if (res.ok || res.redirected) {
                const finalUrl = res.url || "";
                const match = finalUrl.match(/order_id=(\d+)/);
                await refreshCart();
                if (match) {
                    router.push(`/shop/order-confirmation?order_id=${match[1]}`);
                } else {
                    router.push("/shop/orders");
                }
                router.refresh();
                return;
            }
            setSubmitError("تعذر إتمام الطلب، الرجاء المحاولة مرة أخرى");
        } catch {
            setSubmitError("حدث خطأ في الاتصال بالخادم");
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError("");
            try {
                const citiesResponse = await fetch("/api/flask/api/cities", { cache: "no-store" });
                if (!citiesResponse.ok) {
                    throw new Error(`Cities fetch failed: ${citiesResponse.status}`);
                }
                const citiesData: CitiesResponse = await citiesResponse.json();

                setCities(citiesData.city || []);
                
                // Refresh cart from API to get latest data
                await refreshCart();
            } catch {
                setError("تعذر تحميل بيانات الدفع حاليا");
            } finally {
                setLoading(false);
            }
        }

        if (isMounted) {
            loadData();
        }
    }, [isMounted, refreshCart]);

    useEffect(() => {
        async function loadZones(signal: AbortSignal) {
            if (!selectedCity) {
                setZones([]);
                setSelectedZone("");
                return;
            }

            try {
                const response = await fetch(`/api/flask/api/zones?city_id=${encodeURIComponent(selectedCity)}`, { cache: "no-store", signal });
                if (!response.ok) {
                    throw new Error(`Zones fetch failed: ${response.status}`);
                }
                const data: ZonesResponse = await response.json();
                const zoneItems = data.zones || [];
                setZones(zoneItems);
                setSelectedZone(zoneItems[0]?.zone_id || selectedCity);
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
                setZones([]);
                setSelectedZone(selectedCity);
            }
        }

        const controller = new AbortController();
        loadZones(controller.signal);
        return () => controller.abort();
    }, [selectedCity]);

    const selectedCityName = useMemo(() => {
        const found = cities.find((city) => city.city_id === selectedCity);
        return found?.name || "";
    }, [cities, selectedCity]);

    if (loading) {
        return <div className="shop-page-card">جاري تحميل صفحة الدفع...</div>;
    }

    if (error) {
        return <div className="shop-page-card alert alert-danger mb-0">{error}</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="shop-page-card">
                <h1 className="mb-3" style={{ fontWeight: 800 }}>
                    إتمام الطلب
                </h1>
                <div className="alert alert-warning mb-0">
                    السلة فارغة، أضف منتجات قبل إتمام الطلب.
                    <div className="mt-3">
                        <Link href="/shop/products" className="btn btn-primary btn-sm">
                            الذهاب للمتجر
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="row g-4">
            <div className="col-lg-8">
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>
                        إتمام الطلب
                    </h1>
                    {submitError && (
                        <div className="alert alert-danger" role="alert">
                            {submitError}
                        </div>
                    )}
                    <form className="row g-3" onSubmit={handleSubmit}>
                        <input type="hidden" name="total" value={String(cart.total)} />
                        <input type="hidden" name="city_name" value={selectedCityName} />

                        <div className="col-md-6">
                            <label className="form-label">الاسم الكامل</label>
                            <input className="form-control" name="name" placeholder="أدخل الاسم" required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">رقم الهاتف</label>
                            <input className="form-control" name="phone" placeholder="01xxxxxxxxx" required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">المحافظة</label>
                            <select
                                className="form-select"
                                name="city"
                                value={selectedCity}
                                onChange={(event) => setSelectedCity(event.target.value)}
                                required
                            >
                                <option value="">اختر المحافظة</option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.city_id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">المنطقة</label>
                            <select
                                className="form-select"
                                name="zone_id"
                                value={selectedZone}
                                onChange={(event) => setSelectedZone(event.target.value)}
                                required
                            >
                                <option value="">اختر المنطقة</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.zone_id}>
                                        {zone.name}
                                    </option>
                                ))}
                                {zones.length === 0 && selectedCity ? <option value={selectedCity}>المنطقة الافتراضية</option> : null}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label">العنوان</label>
                            <textarea className="form-control" rows={3} name="address" placeholder="العنوان بالتفصيل" required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">طريقة الدفع</label>
                            <select className="form-select" name="payment_method" defaultValue="cash_on_delivery" required>
                                <option value="cash_on_delivery">الدفع عند الاستلام</option>
                                <option value="vodafone_cash">فودافون كاش</option>
                                <option value="visa">بطاقة ائتمان</option>
                            </select>
                        </div>
                        <div className="col-md-6 d-flex align-items-end">
                            <div className="form-check">
                                <input className="form-check-input" id="save_address" type="checkbox" name="save_address" value="1" />
                                <label htmlFor="save_address" className="form-check-label">
                                    حفظ العنوان في حسابي
                                </label>
                            </div>
                        </div>
                        <div className="col-12 d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? "جاري التأكيد..." : "تأكيد الطلب"}
                            </button>
                            <Link href="/shop/cart" className="btn btn-outline-secondary">
                                العودة للسلة
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            <div className="col-lg-4">
                <div className="shop-page-card">
                    <h5 style={{ fontWeight: 700 }}>ملخص الطلب</h5>
                    <div className="mt-3">
                        {cart.items.map((item) => (
                            <div key={item.id} className="d-flex justify-content-between small mb-2">
                                <span>
                                    {item.product.name} × {item.quantity}
                                </span>
                                <strong>{formatMoneyEGP(item.line_total || 0)}</strong>
                            </div>
                        ))}
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mt-2">
                        <span>إجمالي المنتجات</span>
                        <strong>{formatMoneyEGP(cart.subtotal)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                        <span>الشحن</span>
                        <strong>يُحسب بعد اختيار المنطقة</strong>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                        <span>الإجمالي المبدئي</span>
                        <strong>{formatMoneyEGP(cart.total)}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
