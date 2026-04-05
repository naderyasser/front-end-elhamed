import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";
import { formatMoneyEGP } from "@/lib/store-utils";

type OrderItem = {
    id: number;
    created_at: string | null;
    status: string;
    total: number;
};

type OrdersResponse = {
    authenticated: boolean;
    orders: OrderItem[];
};

export const dynamic = "force-dynamic";

function humanDate(value: string | null): string {
    if (!value) return "-";
    return value.split("T")[0];
}

export default async function OrdersPage() {
    const data = await flaskServerJson<OrdersResponse>("/api/frontend/orders");
    const isLoggedIn = Boolean(data?.authenticated);
    const orders = data?.orders || [];

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>
                        طلباتي
                    </h1>

                    {!isLoggedIn ? (
                        <div className="alert alert-warning mb-0">
                            يجب تسجيل الدخول لعرض الطلبات.
                            <div className="mt-3">
                                <Link href="/shop/auth/login" className="btn btn-primary btn-sm">
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="alert alert-info mb-0">لا توجد طلبات حتى الآن.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>رقم الطلب</th>
                                        <th>التاريخ</th>
                                        <th>الحالة</th>
                                        <th>القيمة</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{humanDate(order.created_at)}</td>
                                            <td>{order.status || "pending"}</td>
                                            <td>{formatMoneyEGP(order.total)}</td>
                                            <td>
                                                <Link href={`/api/flask/order_confirmation?order_id=${order.id}`} className="btn btn-sm btn-outline-primary">
                                                    التفاصيل
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
