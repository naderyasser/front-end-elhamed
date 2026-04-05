"use client";

// Suggested path: app/admin/orders/page.tsx
// Converted from: templates/admin/orders.html

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  name: string;
  phone: string;
  city_name: string;
  cod_amount: number;
  shipping_status: string;
  payment_status: string;
  payment_method: string;
  items_count: number;
  created_at: string;
}

interface Pagination {
  page: number;
  pages: number;
  per_page: number;
  has_prev: boolean;
  has_next: boolean;
  prev_num: number;
  next_num: number;
}

interface OrdersData {
  orders: Order[];
  total_filtered: number;
  pagination: Pagination;
  filters: Record<string, string>;
  options: {
    status: { value: string; label: string }[];
    payment: { value: string; label: string }[];
    shipping: { value: string; label: string }[];
  };
}

const shippingLabel: Record<string, string> = {
  pending: "قيد الانتظار",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  returned: "تم الإرجاع",
  cancelled: "ملغي",
};
const shippingClass: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  returned: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};
const paymentLabel: Record<string, string> = { paid: "مدفوع", pending: "في الانتظار" };
const paymentClass: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
};
const paymentMethodLabel: Record<string, string> = {
  cash_on_delivery: "الدفع عند الاستلام",
  vodafone_cash: "فودافون كاش",
  visa: "فيزا",
};

const DUMMY_DATA: OrdersData = {
  orders: [],
  total_filtered: 0,
  pagination: { page: 1, pages: 1, per_page: 20, has_prev: false, has_next: false, prev_num: 0, next_num: 2 },
  filters: {},
  options: { status: [], payment: [], shipping: [] },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [data, setData] = useState<OrdersData>(DUMMY_DATA);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [editStatusModal, setEditStatusModal] = useState<{ orderId: number; currentStatus: string } | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const currentParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const page = currentParams.get("page") ?? "1";
  const search = currentParams.get("search") ?? "";
  const status = currentParams.get("status") ?? "";
  const payment = currentParams.get("payment") ?? "";
  const shipping = currentParams.get("shipping") ?? "";
  const startDate = currentParams.get("start_date") ?? "";
  const endDate = currentParams.get("end_date") ?? "";

  useEffect(() => {
    const params = new URLSearchParams({ page, search, status, payment, shipping, start_date: startDate, end_date: endDate });
    fetch(`/api/flask/admin/api/orders?${params}`)
      .then((r) => r.json())
      .then((d) => setData({ ...DUMMY_DATA, ...d, orders: d?.orders ?? [], options: { status: [], payment: [], shipping: [], ...(d?.options ?? {}) } }))
      .catch(() => { });
  }, [page, search, status, payment, shipping, startDate, endDate]);

  function buildUrl(extra: Record<string, string>) {
    const p = new URLSearchParams({ page, search, status, payment, shipping, start_date: startDate, end_date: endDate, ...extra });
    return `/admin/orders?${p}`;
  }

  async function handleStatusUpdate(orderId: number, newSt: string) {
    const fd = new FormData();
    fd.append("status", newSt);
    await fetch(`/api/flask/admin/orders/${orderId}/status`, { method: "POST", body: fd });
    setEditStatusModal(null);
    router.refresh();
  }

  async function handleDelete(orderId: number, name: string) {
    if (!confirm(`هل أنت متأكد من حذف طلب ${name}؟`)) return;
    await fetch(`/api/flask/admin/orders/${orderId}`, { method: "DELETE" });
    router.refresh();
  }

  function toggleSelect(id: number) {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="backdrop-blur-sm sticky top-0 z-10 shadow-sm"
        style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}
      >
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0071ce] to-[#004c91] rounded-xl flex items-center justify-center text-gray-800 shadow-lg">
                <i className="bx bx-cart text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h1>
                <p className="text-gray-500 text-sm">إدارة ومتابعة جميع طلبات العملاء</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
                <i className="bx bx-export text-lg" /> <span className="font-medium">تصدير</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl flex items-center gap-2"
                style={{ background: "#f8f9fa", color: "#4a5568", border: "1px solid #cfd8dc" }}
              >
                <i className="bx bx-printer text-lg" /> <span className="font-medium">طباعة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "إجمالي الطلبات", value: data.total_filtered, icon: "bx-cart", color: "from-blue-500 to-blue-600" },
            { label: "قيد الانتظار", value: (data.orders ?? []).filter((o) => o.shipping_status === "pending").length, icon: "bx-time", color: "from-orange-500 to-orange-600" },
            { label: "تم الشحن", value: (data.orders ?? []).filter((o) => o.shipping_status === "shipped").length, icon: "bx-truck", color: "from-purple-500 to-purple-600" },
            { label: "تم التوصيل", value: (data.orders ?? []).filter((o) => o.shipping_status === "delivered").length, icon: "bx-check-circle", color: "from-green-500 to-green-600" },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ background: "#fff", border: "1px solid #cfd8dc" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-gray-800`}>
                  <i className={`bx ${icon} text-xl`} />
                </div>
                <span className="text-3xl font-bold text-gray-800">{value}</span>
              </div>
              <h3 className="text-gray-500 font-medium">{label}</h3>
            </div>
          ))}
        </div>

        {/* Filters */}
        <form
          className="rounded-2xl shadow-lg p-6 mb-8"
          style={{ background: "#fff", border: "1px solid #cfd8dc" }}
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const params = new URLSearchParams();
            fd.forEach((v, k) => { if (v) params.set(k, v.toString()); });
            router.push(`/admin/orders?${params}`);
          }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-2">البحث في الطلبات</label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none"
                />
                <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
              </div>
            </div>
            {["status", "payment", "shipping"].map((field) => (
              <div key={field} className="lg:w-48">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  {field === "status" ? "حالة الطلب" : field === "payment" ? "طريقة الدفع" : "حالة الشحن"}
                </label>
                <select
                  name={field}
                  defaultValue={currentParams.get(field) ?? ""}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none"
                >
                  <option value="">الكل</option>
                  {(data.options[field as keyof typeof data.options] ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4" style={{ borderTop: "1px solid #222" }}>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">من تاريخ</label>
              <input type="date" name="start_date" defaultValue={startDate} className="w-full px-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">إلى تاريخ</label>
              <input type="date" name="end_date" defaultValue={endDate} className="w-full px-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="flex-1 btn-accent py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2">
                <i className="bx bx-filter" /> تطبيق الفلتر
              </button>
              <Link href="/admin/orders" className="py-3 px-4 rounded-xl flex items-center justify-center" style={{ background: "#e2e8f0", color: "#4a5568" }}>
                <i className="bx bx-refresh" />
              </Link>
            </div>
          </div>
        </form>

        {/* Orders Grid */}
        {data.orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(211,47,47,0.1)" }}>
              <i className="bx bx-cart text-4xl text-[#0071ce]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500 mb-6">لم يتم العثور على طلبات تطابق معايير البحث</p>
            <Link href="/admin/orders" className="btn-accent px-6 py-3 rounded-xl font-medium">
              عرض جميع الطلبات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                style={{ background: "#fff", border: "1px solid #cfd8dc" }}
              >
                {/* Order Header */}
                <div className="p-6 relative" style={{ background: "rgba(211,47,47,0.04)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 btn-accent rounded-xl flex items-center justify-center text-sm font-bold">
                        #{order.id}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{order.name}</h3>
                        <p className="text-sm text-gray-500">{order.created_at}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="rounded"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${shippingClass[order.shipping_status] ?? "bg-gray-100 text-gray-700"}`}>
                      {shippingLabel[order.shipping_status] ?? order.shipping_status}
                    </span>
                    {order.payment_status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentClass[order.payment_status] ?? "bg-gray-100 text-gray-700"}`}>
                        {paymentLabel[order.payment_status] ?? order.payment_status}
                      </span>
                    )}
                  </div>
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Link href={`/admin/orders/${order.id}`} className="bg-white/90 hover:bg-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                      <i className="bx bx-show text-lg" />
                    </Link>
                    <button
                      onClick={() => { setEditStatusModal({ orderId: order.id, currentStatus: order.shipping_status }); setNewStatus(order.shipping_status); }}
                      className="bg-white/90 hover:bg-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <i className="bx bx-edit text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id, order.name)}
                      className="bg-white/90 hover:bg-white text-red-500 w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <i className="bx bx-trash text-lg" />
                    </button>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><i className="bx bx-phone text-[#0071ce]" /> الهاتف:</span>
                      <a href={`tel:${order.phone}`} className="font-medium text-gray-300 hover:text-[#0071ce]">{order.phone}</a>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><i className="bx bx-map text-[#0071ce]" /> المدينة:</span>
                      <span className="font-medium text-gray-300">{order.city_name || "غير معروف"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><i className="bx bx-package text-[#0071ce]" /> المنتجات:</span>
                      <span className="font-medium text-gray-300">{order.items_count || 0} منتج</span>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 mb-4" style={{ background: "#f8f9fa" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">المبلغ الإجمالي:</span>
                      <span className="text-lg font-bold text-gray-800">{order.cod_amount} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">طريقة الدفع:</span>
                      <span className="text-sm font-medium text-gray-300">{paymentMethodLabel[order.payment_method] ?? order.payment_method}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex-1 py-2 px-3 rounded-xl font-medium flex items-center justify-center gap-1 transition-all duration-200"
                      style={{ background: "rgba(211,47,47,0.1)", color: "#0071ce" }}
                    >
                      <i className="bx bx-show text-sm" /> <span>عرض</span>
                    </Link>
                    <button
                      onClick={() => { setEditStatusModal({ orderId: order.id, currentStatus: order.shipping_status }); setNewStatus(order.shipping_status); }}
                      className="py-2 px-3 rounded-xl font-medium flex items-center justify-center transition-all duration-200"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}
                    >
                      <i className="bx bx-edit text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id, order.name)}
                      className="py-2 px-3 rounded-xl font-medium flex items-center justify-center transition-all duration-200"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
                    >
                      <i className="bx bx-trash text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.pagination.pages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {data.pagination.has_prev && (
                <Link href={buildUrl({ page: String(data.pagination.prev_num) })} className="px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-50 transition-colors" style={{ background: "#f8f9fa", border: "1px solid #cfd8dc", color: "#4a5568" }}>
                  <i className="bx bx-chevron-right" /> السابق
                </Link>
              )}
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${data.pagination.page === p ? "btn-accent" : "hover:bg-blue-50"
                    }`}
                  style={data.pagination.page !== p ? { background: "#f8f9fa", border: "1px solid #cfd8dc", color: "#4a5568" } : {}}
                >
                  {p}
                </Link>
              ))}
              {data.pagination.has_next && (
                <Link href={buildUrl({ page: String(data.pagination.next_num) })} className="px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-50 transition-colors" style={{ background: "#f8f9fa", border: "1px solid #cfd8dc", color: "#4a5568" }}>
                  التالي <i className="bx bx-chevron-left" />
                </Link>
              )}
            </div>
            <div className="text-center text-gray-500 text-sm">
              عرض {(data.pagination.page - 1) * data.pagination.per_page + 1} إلى{" "}
              {(data.pagination.page - 1) * data.pagination.per_page + data.orders.length} من {data.total_filtered} طلب
            </div>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {editStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: "1px solid #222" }}>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-gray-800">
                  <i className="bx bx-edit text-lg" />
                </div>
                تحديث حالة الطلب
              </h2>
              <button onClick={() => setEditStatusModal(null)} className="text-2xl text-gray-500 hover:text-gray-800 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white">
                <i className="bx bx-x" />
              </button>
            </div>
            <div className="p-6">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800 mb-4"
              >
                {Object.entries(shippingLabel).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button onClick={() => setEditStatusModal(null)} className="flex-1 py-3 px-4 rounded-xl font-medium" style={{ background: "#f8f9fa", color: "#4a5568", border: "1px solid #cfd8dc" }}>
                  إلغاء
                </button>
                <button onClick={() => handleStatusUpdate(editStatusModal.orderId, newStatus)} className="flex-1 btn-accent py-3 px-4 rounded-xl font-medium">
                  تحديث الحالة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
