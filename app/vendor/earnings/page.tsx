"use client";
import { useState, useEffect } from "react";

interface EarningsData {
    total_sales: number; pending_balance: number; total_commission: number;
    monthly_chart: { labels: string[]; data: number[] };
    payouts: { id: number; amount: number; method: string; status: string; created_at: string }[];
}

const PAYOUT_STATUS: Record<string, { label: string; bg: string }> = {
    pending: { label: "قيد المراجعة", bg: "#FFA500" },
    approved: { label: "تمت الموافقة", bg: "#2196F3" },
    completed: { label: "تم التحويل", bg: "#4CAF50" },
    rejected: { label: "مرفوض", bg: "#f44336" },
};

export default function VendorEarningsPage() {
    const [data, setData] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPayout, setShowPayout] = useState(false);
    const [payForm, setPayForm] = useState({ amount: "", method: "bank_transfer", notes: "" });

    const load = () => {
        setLoading(true);
        fetch("/api/flask/vendor/api/earnings").then(r => r.json())
            .then(setData).finally(() => setLoading(false));
    };
    useEffect(load, []);

    async function requestPayout() {
        await fetch("/api/flask/vendor/api/payouts", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payForm),
        });
        setShowPayout(false);
        setPayForm({ amount: "", method: "bank_transfer", notes: "" });
        load();
    }

    if (loading || !data) return <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div>;

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-wallet" /> الأرباح والتحويلات</h1>
                <button onClick={() => setShowPayout(true)} className="btn-cta-alha d-flex align-items-center gap-2"
                    style={{ padding: "8px 18px", borderRadius: 10, fontSize: "0.88rem" }}>
                    <i className="bx bx-transfer" /> طلب تحويل
                </button>
            </div>

            {/* Summary cards */}
            <div className="row g-3 mb-4">
                {[
                    { icon: "bx-money", label: "إجمالي المبيعات", value: `${Math.round(data.total_sales).toLocaleString("ar-EG")} ج.م`, color: "#4CAF50" },
                    { icon: "bx-wallet", label: "الرصيد المعلق", value: `${Math.round(data.pending_balance).toLocaleString("ar-EG")} ج.م`, color: "#FF9800" },
                    { icon: "bx-receipt", label: "إجمالي العمولات", value: `${Math.round(data.total_commission).toLocaleString("ar-EG")} ج.م`, color: "#f44336" },
                ].map((c, i) => (
                    <div key={i} className="col-md-4">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: `${c.color}18`, color: c.color }}><i className={`bx ${c.icon}`} /></div>
                            <div>
                                <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                                <div className="stat-label">{c.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly chart (simple bars) */}
            {data.monthly_chart && data.monthly_chart.labels.length > 0 && (
                <div className="admin-card mb-4">
                    <div className="admin-card-header"><h3><i className="bx bx-bar-chart-alt-2" /> الأرباح الشهرية</h3></div>
                    <div className="admin-card-body">
                        <div className="d-flex align-items-end gap-2" style={{ height: 160 }}>
                            {data.monthly_chart.labels.map((label, i) => {
                                const maxVal = Math.max(...data.monthly_chart.data, 1);
                                const h = (data.monthly_chart.data[i] / maxVal) * 140;
                                return (
                                    <div key={i} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                                        <span style={{ fontSize: "0.7rem", fontWeight: 600, marginBottom: 4 }}>{Math.round(data.monthly_chart.data[i]).toLocaleString("ar-EG")}</span>
                                        <div style={{ width: "80%", height: h, background: "var(--alha-primary, #0071CE)", borderRadius: "6px 6px 0 0", minHeight: 4 }} />
                                        <span style={{ fontSize: "0.68rem", color: "#888", marginTop: 4 }}>{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Payouts history */}
            <div className="admin-card">
                <div className="admin-card-header"><h3><i className="bx bx-transfer" /> سجل التحويلات</h3></div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>#</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>المبلغ</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>الطريقة</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>الحالة</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.payouts || []).map(p => (
                                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>{p.id}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>{Math.round(p.amount).toLocaleString("ar-EG")} ج.م</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>{p.method === "bank_transfer" ? "تحويل بنكي" : p.method === "vodafone_cash" ? "فودافون كاش" : p.method}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <span style={{ background: PAYOUT_STATUS[p.status]?.bg || "#888", color: "#fff", padding: "3px 12px", borderRadius: 12, fontSize: "0.78rem" }}>
                                            {PAYOUT_STATUS[p.status]?.label || p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.82rem" }}>{new Date(p.created_at).toLocaleDateString("ar-EG")}</td>
                                </tr>
                            ))}
                            {(data.payouts || []).length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>لا يوجد تحويلات سابقة</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout request modal */}
            {showPayout && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowPayout(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 420 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-transfer" /> طلب تحويل</h2>
                            <button className="admin-modal-close" onClick={() => setShowPayout(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="mb-3" style={{ background: "#e8f5e9", padding: "12px 16px", borderRadius: 10, fontSize: "0.85rem" }}>
                                الرصيد المتاح: <strong>{Math.round(data.pending_balance).toLocaleString("ar-EG")} ج.م</strong>
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">المبلغ (ج.م) <span className="text-danger">*</span></label>
                                <input type="number" className="admin-form-control" value={payForm.amount}
                                    onChange={e => setPayForm({ ...payForm, amount: e.target.value })} max={data.pending_balance} />
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">طريقة التحويل</label>
                                <select className="admin-form-control" value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })}>
                                    <option value="bank_transfer">تحويل بنكي</option>
                                    <option value="vodafone_cash">فودافون كاش</option>
                                    <option value="instapay">انستاباي</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="admin-form-label">ملاحظات</label>
                                <textarea className="admin-form-control" rows={2} value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowPayout(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={requestPayout} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-send" /> إرسال الطلب</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
