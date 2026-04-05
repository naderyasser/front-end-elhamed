import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";

type Address = {
    id: number;
    label: string;
    name: string;
    phone: string;
    city: string;
    address: string;
    is_default: boolean;
};

type AddressesResponse = {
    authenticated: boolean;
    addresses: Address[];
};

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
    const data = await flaskServerJson<AddressesResponse>("/api/frontend/addresses");
    const isLoggedIn = Boolean(data?.authenticated);
    const addresses = data?.addresses || [];

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>
                        عناويني
                    </h1>

                    {!isLoggedIn ? (
                        <div className="alert alert-warning mb-0">
                            يجب تسجيل الدخول لإدارة العناوين.
                            <div className="mt-3">
                                <Link href="/shop/auth/login" className="btn btn-primary btn-sm">
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="alert alert-info mb-0">لا توجد عناوين محفوظة حتى الآن.</div>
                    ) : (
                        <div className="row g-3">
                            {addresses.map((address) => (
                                <div key={address.id} className="col-md-6">
                                    <article className="shop-page-card h-100">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <h6 className="m-0">{address.label || "عنوان"}</h6>
                                            {address.is_default ? <span className="badge bg-success">افتراضي</span> : null}
                                        </div>
                                        <div className="small text-muted">{address.name}</div>
                                        <div className="small text-muted">{address.phone}</div>
                                        <div className="small text-muted">{address.city}</div>
                                        <div className="mt-2">{address.address}</div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
