"use client";

// Suggested path: app/admin/orders/[id]/page.tsx
// Converted from: templates/admin/order.html

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface OrderItem {
  order_item: { id: number; quantity: number };
  product: { id: number; name: string; image: string; price: number; category: string };
  item_total: number;
}

interface OrderData {
  order: {
    id: number; name: string; phone: string; email: string; address: string;
    zone_id: string; district_id: string; shipping_status: string; payment_method: string;
    package_size: string; package_type: string; cod_amount: number;
    created_at: string;
  };
  order_summary: {
    shipping_status: string; payment_status: string; payment_method: string;
    tracking_number: string; business_reference: string; subtotal: number;
    shipping_cost: number; total_amount: number; items_count: number;
  };
  order_items: OrderItem[];
  city_name: string;
}

const DUMMY: OrderData = {
  order: { id: 0, name: "", phone: "", email: "", address: "", zone_id: "", district_id: "", shipping_status: "", payment_method: "", package_size: "", package_type: "", cod_amount: 0, created_at: "" },
  order_summary: { shipping_status: "", payment_status: "", payment_method: "", tracking_number: "", business_reference: "", subtotal: 0, shipping_cost: 0, total_amount: 0, items_count: 0 },
  order_items: [],
  city_name: "",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  const [data, setData] = useState<OrderData>(DUMMY);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetch(`/api/flask/admin/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setNewStatus(d.order.shipping_status); })
      .catch(() => {});
  }, [orderId]);

  async function handleStatusUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/flask/admin/orders/${orderId}/status`, { method: "POST", body: fd });
    router.refresh();
  }

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    await fetch(`/api/flask/admin/orders/${orderId}`, { method: "DELETE" });
    router.push("/admin/orders");
  }

  async function deleteItem(itemId: number) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج من الطلب؟")) return;
    await fetch(`/api/flask/admin/orders/${orderId}/items/${itemId}`, { method: "DELETE" });
    router.refresh();
  }

  const { order, order_summary, order_items, city_name } = data;

  const statusColor = (s: string) =>
    s === "تم التوصيل" || s === "تم الدفع" ? "bg-green-100 text-green-800"
    : s === "ملغي" || s === "فشل الدفع" ? "bg-red-100 text-red-800"
    : "bg-yellow-100 text-yellow-800";

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="مسار التنقل">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li><Link href="/admin/dashboard" className="text-gray-500 hover:text-[#0071ce] flex items-center gap-1"><i className="bx bx-home" /> الرئيسية</Link></li>
          <li><div className="flex items-center gap-1"><i className="bx bx-chevron-left text-gray-600" /><Link href="/admin/orders" className="text-gray-500 hover:text-[#0071ce]">الطلبات</Link></div></li>
          <li><div className="flex items-center gap-1"><i className="bx bx-chevron-left text-gray-600" /><span className="text-gray-500">طلب #{order.id}</span></div></li>
        </ol>
      </nav>

      {/* Title */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bx bx-receipt text-[#0071ce]" /> تفاصيل الطلب #{order.id}
          </h1>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(order_summary.shipping_status)}`}>
              <i className="bx bx-package ml-1" />{order_summary.shipping_status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(order_summary.payment_status)}`}>
              <i className="bx bx-credit-card ml-1" />{order_summary.payment_status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors" style={{ background: "#e2e8f0", color: "#4a5568" }}>
            <i className="bx bx-printer" /> طباعة الطلب
          </button>
          <Link href="/admin/orders" className="btn-accent px-4 py-2 rounded-lg flex items-center gap-2">
            <i className="bx bx-arrow-back" /> العودة للطلبات
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl p-6 mb-6" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="bx bx-cog text-[#0071ce]" /> إجراءات الطلب
          </h2>
          <div className="flex flex-wrap gap-3">
            <form onSubmit={handleStatusUpdate} className="flex gap-2">
              <select name="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="border px-3 py-2 rounded-lg bg-white border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none">
                <option value="pending">قيد الانتظار</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التوصيل</option>
                <option value="cancelled">ملغي</option>
              </select>
              <button type="submit" className="bg-blue-600 text-gray-800 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <i className="bx bx-refresh" /> تحديث الحالة
              </button>
            </form>
            <form onSubmit={handleDelete}>
              <button type="submit" className="bg-red-600 text-gray-800 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                <i className="bx bx-trash" /> حذف الطلب
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="xl:col-span-1">
          <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 pb-3 flex items-center gap-2" style={{ borderBottom: "1px solid #222" }}>
              <i className="bx bx-user text-[#0071ce]" /> معلومات العميل
            </h2>
            <div className="space-y-3">
              {[
                { label: "الاسم", value: order.name },
                { label: "المدينة", value: city_name },
                { label: "المنطقة", value: order.zone_id },
                { label: "الحي", value: order.district_id },
                { label: "تاريخ الطلب", value: order.created_at },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#f8f9fa" }}>
                  <span className="text-gray-500 font-medium">{label}:</span>
                  <span className="font-medium text-gray-200">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#f8f9fa" }}>
                <span className="text-gray-500 font-medium">الهاتف:</span>
                <a href={`tel:${order.phone}`} className="text-[#0071ce] hover:text-red-400 font-medium flex items-center gap-1">
                  <i className="bx bx-phone" />{order.phone}
                </a>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#f8f9fa" }}>
                <span className="text-gray-500 font-medium">البريد الإلكتروني:</span>
                <a href={`mailto:${order.email}`} className="text-[#0071ce] hover:text-red-400 font-medium flex items-center gap-1">
                  <i className="bx bx-envelope" />{order.email}
                </a>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "#f8f9fa" }}>
                <span className="text-gray-500 font-medium block mb-2">العنوان:</span>
                <span className="text-gray-200">{order.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="xl:col-span-2">
          <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 pb-3 flex items-center gap-2" style={{ borderBottom: "1px solid #222" }}>
              <i className="bx bx-package text-[#0071ce]" /> ملخص الطلب
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[
                  { label: "طريقة الدفع", value: order_summary.payment_method },
                  { label: "رقم التتبع", value: order_summary.tracking_number },
                  { label: "المرجع", value: order_summary.business_reference },
                  { label: "حجم الطرد", value: order.package_size },
                  { label: "نوع الطرد", value: order.package_type },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#f8f9fa" }}>
                    <span className="text-gray-500">{label}:</span>
                    <span className="text-gray-200 font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#f8f9fa" }}>
                  <span className="text-gray-500">المجموع الفرعي:</span>
                  <span className="font-semibold text-gray-200">{order_summary.subtotal?.toFixed(2)} ج.م</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#f8f9fa" }}>
                  <span className="text-gray-500">تكلفة الشحن:</span>
                  <span className="font-semibold text-gray-200">{order_summary.shipping_cost?.toFixed(2)} ج.م</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.1)" }}>
                  <span className="text-green-400">الخصم:</span>
                  <span className="text-green-400 font-semibold">
                    {((order_summary.subtotal + order_summary.shipping_cost - order.cod_amount) || 0).toFixed(2)} ج.م
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border-2" style={{ background: "rgba(211,47,47,0.08)", borderColor: "rgba(211,47,47,0.3)" }}>
                  <span className="text-[#0071ce] font-bold text-lg">المجموع الكلي:</span>
                  <span className="text-[#0071ce] font-bold text-xl">{order.cod_amount?.toFixed(2)} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6 rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 p-6" style={{ borderBottom: "1px solid #222" }}>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="bx bx-list-ul text-[#0071ce]" /> المنتجات المطلوبة
            <span className="rounded px-2 py-0.5 text-sm font-medium" style={{ background: "rgba(211,47,47,0.1)", color: "#0071ce" }}>
              {order_summary.items_count} منتج
            </span>
          </h2>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors" style={{ background: "#e2e8f0", color: "#4a5568" }}>
            <i className="bx bx-printer" /> طباعة قائمة المنتجات
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: "#f8f9fa" }}>
              <tr className="text-sm text-gray-500">
                <th className="px-6 py-4 text-right font-semibold">المنتج</th>
                <th className="px-6 py-4 text-center font-semibold">التصنيف</th>
                <th className="px-6 py-4 text-center font-semibold">السعر</th>
                <th className="px-6 py-4 text-center font-semibold">الكمية</th>
                <th className="px-6 py-4 text-center font-semibold">المجموع</th>
                <th className="px-6 py-4 text-center font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {order_items.map(({ order_item, product, item_total }) => (
                <tr key={order_item.id} className="text-sm hover:bg-white transition-colors" style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#cfd8dc]">
                        <img src={`/api/flask/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-gray-500 text-xs">#{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-900/30 text-blue-400 text-xs font-medium px-2.5 py-0.5 rounded">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-gray-200">{product.price?.toFixed(2)} ج.م</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-white text-gray-300 px-3 py-1 rounded-full font-medium border border-[#cfd8dc]">{order_item.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-[#0071ce]">{item_total?.toFixed(2)} ج.م</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => deleteItem(order_item.id)} className="bg-red-900/30 text-red-400 px-3 py-1 rounded-lg hover:bg-red-900/50 transition-colors">
                      <i className="bx bx-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: "#f8f9fa" }}>
              <tr className="font-semibold">
                <td colSpan={4} className="px-6 py-4 text-right text-gray-500">المجموع الفرعي:</td>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-200">{order_summary.subtotal?.toFixed(2)} ج.م</td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={4} className="px-6 py-4 text-right text-gray-500">تكلفة الشحن:</td>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-200">{order_summary.shipping_cost?.toFixed(2)} ج.م</td>
              </tr>
              <tr className="font-bold" style={{ background: "rgba(211,47,47,0.08)" }}>
                <td colSpan={4} className="px-6 py-4 text-right text-[#0071ce] text-lg">المجموع الكلي:</td>
                <td colSpan={2} className="px-6 py-4 text-center text-[#0071ce] text-lg">{order_summary.total_amount?.toFixed(2)} ج.م</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
