"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Vendor {
  id: number; store_name: string; slug: string; status: string;
  phone: string; city: string; rating: number; rating_count: number;
  commission_rate: number; commission_type: string;
  total_sales: number; pending_balance: number; product_count: number;
  created_at: string; user?: { name: string; email: string };
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/flask/admin/api/vendors${filter ? `?status=${filter}` : ""}`)
      .then(r => r.json()).then(d => setVendors(d.vendors || []))
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateStatus(vid: number, status: string, reason = "") {
    await fetch(`/api/flask/admin/api/vendors/${vid}/status`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    setVendors(prev => prev.map(v => v.id === vid ? { ...v, status } : v));
  }

  const statusBadge: Record<string, { bg: string; label: string }> = {
    pending: { bg: "#FFA500", label: "قيد المراجعة" },
    approved: { bg: "#4CAF50", label: "مقبول" },
    active: { bg: "#2196F3", label: "نشط" },
    suspended: { bg: "#f44336", label: "معلق" },
    rejected: { bg: "#9E9E9E", label: "مرفوض" },
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="admin-page-title"><i className="bx bx-store-alt" /> إدارة البائعين</h1>
        <div className="d-flex gap-2">
          {["", "pending", "approved", "active", "suspended"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`btn-sm ${filter === s ? "btn-cta-alha" : "btn-outline-alha"}`}
              style={{ padding: "6px 14px", borderRadius: 8, fontSize: "0.82rem", border: filter === s ? "none" : "1px solid #ddd" }}>
              {s === "" ? "الكل" : statusBadge[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
        <div className="admin-card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>المتجر</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>البائع</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>الحالة</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>المنتجات</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>التقييم</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>العمولة</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>الرصيد المعلق</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <strong>{v.store_name}</strong>
                    <div style={{ fontSize: "0.78rem", color: "#888" }}>{v.city}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {v.user?.name || "—"}
                    <div style={{ fontSize: "0.78rem", color: "#888" }}>{v.user?.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span style={{
                      background: statusBadge[v.status]?.bg || "#888", color: "#fff",
                      padding: "4px 12px", borderRadius: 12, fontSize: "0.78rem",
                    }}>{statusBadge[v.status]?.label || v.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>{v.product_count}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <i className="bx bxs-star" style={{ color: "#FFC107" }} /> {v.rating.toFixed(1)}
                    <span style={{ fontSize: "0.75rem", color: "#aaa" }}> ({v.rating_count})</span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {v.commission_rate}%
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>
                    {v.pending_balance.toFixed(0)} ج.م
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <div className="d-flex gap-1 justify-content-center">
                      {v.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(v.id, "approved")}
                            style={{ background: "#4CAF50", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
                            قبول
                          </button>
                          <button onClick={() => updateStatus(v.id, "rejected", "لم يتم استيفاء الشروط")}
                            style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
                            رفض
                          </button>
                        </>
                      )}
                      {v.status === "approved" && (
                        <button onClick={() => updateStatus(v.id, "active")}
                          style={{ background: "#2196F3", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
                          تفعيل
                        </button>
                      )}
                      {v.status === "active" && (
                        <button onClick={() => updateStatus(v.id, "suspended", "مخالفة للشروط")}
                          style={{ background: "#FF9800", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
                          تعليق
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>لا يوجد بائعين</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
