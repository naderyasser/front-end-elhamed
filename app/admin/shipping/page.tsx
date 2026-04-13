"use client";

// Suggested path: app/admin/shipping/page.tsx
// Converted from: templates/admin/shipping.html

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Zone { id: number; name: string; shipping_cost: number }
interface District { id: number; name: string; zone_id: number }
interface City { id: number; name: string; zones: Zone[] }
interface Stats { total_zones: number; total_districts: number; avg_shipping_cost: number }

export default function AdminShippingPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [stats, setStats] = useState<Stats>({ total_zones: 0, total_districts: 0, avg_shipping_cost: 0 });
  const [addCityOpen, setAddCityOpen] = useState(false);
  const [addZoneOpen, setAddZoneOpen] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/flask/admin/api/shipping", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setCities(d.cities ?? []); setStats(d.stats ?? {}); if (d.cities?.length) setActiveTab(d.cities[0].id); })
      .catch(() => { });
  }, []);

  async function handleAddCity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/flask/admin/shipping/cities/add", { method: "POST", body: fd, credentials: "include" });
    setAddCityOpen(false); router.refresh();
  }

  async function handleAddZone(e: React.FormEvent<HTMLFormElement>, cityId: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("city_id", String(cityId));
    await fetch("/api/flask/admin/shipping/zones/add", { method: "POST", body: fd, credentials: "include" });
    setAddZoneOpen(null); router.refresh();
  }

  async function handleDeleteCity(id: number) {
    if (!confirm("حذف هذه المدينة وجميع مناطقها؟")) return;
    await fetch(`/api/flask/admin/shipping/cities/${id}`, { method: "DELETE", credentials: "include" });
    setCities((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleDeleteZone(id: number) {
    if (!confirm("حذف هذه المنطقة؟")) return;
    await fetch(`/api/flask/admin/shipping/zones/${id}`, { method: "DELETE", credentials: "include" });
    router.refresh();
  }

  const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce]";

  return (
    <div className="min-h-screen">
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}>
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0071ce] to-[#004c91] rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bx-map text-2xl" /></div>
              <div><h1 className="text-2xl font-bold text-gray-800">إدارة الشحن والمناطق</h1><p className="text-gray-500 text-sm">إدارة المدن والمناطق وأسعار الشحن</p></div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "إجمالي المدن", value: cities.length, icon: "bx-map", color: "bg-blue-100 text-blue-600" },
                { label: "المناطق", value: stats.total_zones, icon: "bx-map-pin", color: "bg-green-100 text-green-600" },
                { label: "الأحياء", value: stats.total_districts, icon: "bx-building-house", color: "bg-purple-100 text-purple-600" },
                { label: "متوسط الشحن", value: `${Math.round(stats.avg_shipping_cost)} ج.م`, icon: "bx-dollar", color: "bg-orange-100 text-orange-600" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="rounded-xl p-4 shadow-sm" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><i className={`bx ${icon}`} /></div>
                    <div><p className="text-sm text-gray-500">{label}</p><p className="text-xl font-bold text-gray-800">{value}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button onClick={() => setAddCityOpen(true)} className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2">
            <i className="bx bx-plus" /> إضافة مدينة
          </button>
        </div>

        {/* City Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {cities.map((city) => (
            <button key={city.id} onClick={() => setActiveTab(city.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === city.id ? "btn-accent" : ""}`}
              style={activeTab !== city.id ? { background: "#f8f9fa", border: "1px solid #cfd8dc", color: "#4a5568" } : {}}>
              {city.name}
            </button>
          ))}
        </div>

        {/* Active City Content */}
        {cities.filter((c) => c.id === activeTab).map((city) => (
          <div key={city.id} className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #222" }}>
              <h3 className="font-bold text-gray-800 text-xl">{city.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => setAddZoneOpen(city.id)} className="btn-accent px-4 py-2 rounded-xl text-sm flex items-center gap-1">
                  <i className="bx bx-plus" /> إضافة منطقة
                </button>
                <button onClick={() => handleDeleteCity(city.id)} className="px-4 py-2 rounded-xl text-sm flex items-center gap-1 transition-colors" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                  <i className="bx bx-trash" /> حذف المدينة
                </button>
              </div>
            </div>
            {addZoneOpen === city.id && (
              <div className="px-6 py-4" style={{ background: "#f8f9fa", borderBottom: "1px solid #222" }}>
                <form onSubmit={(e) => handleAddZone(e, city.id)} className="flex gap-3 flex-wrap">
                  <input type="text" name="name" placeholder="اسم المنطقة" required className={inputCls + " flex-1 min-w-[150px]"} />
                  <input type="number" name="shipping_cost" placeholder="سعر الشحن" step={0.01} required className={inputCls + " w-36"} />
                  <button type="submit" className="btn-accent px-4 py-3 rounded-xl">إضافة</button>
                  <button type="button" onClick={() => setAddZoneOpen(null)} className="px-4 py-3 rounded-xl bg-gray-100 text-gray-500">إلغاء</button>
                </form>
              </div>
            )}
            <div className="p-6">
              {city.zones.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد مناطق بعد. أضف منطقة للبدء.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {city.zones.map((zone) => (
                    <div key={zone.id} className="rounded-xl p-4 flex items-center justify-between" style={{ background: "#f8f9fa", border: "1px solid #cfd8dc" }}>
                      <div>
                        <p className="font-medium text-gray-800">{zone.name}</p>
                        <p className="text-sm text-[#0071ce] font-bold">{zone.shipping_cost} ج.م</p>
                      </div>
                      <button onClick={() => handleDeleteZone(zone.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <i className="bx bx-trash text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add City Modal */}
      {addCityOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: "1px solid #222" }}>
              <h2 className="text-xl font-bold text-gray-800">إضافة مدينة جديدة</h2>
              <button onClick={() => setAddCityOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl"><i className="bx bx-x" /></button>
            </div>
            <form onSubmit={handleAddCity} className="p-6 space-y-4">
              <div><label className="block text-gray-300 text-sm mb-2">اسم المدينة <span className="text-red-500">*</span></label>
                <input type="text" name="name" required className={inputCls} /></div>
              <div><label className="block text-gray-300 text-sm mb-2">سعر الشحن الافتراضي</label>
                <input type="number" name="default_shipping_cost" step={0.01} className={inputCls} /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAddCityOpen(false)} className="flex-1 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-300">إلغاء</button>
                <button type="submit" className="flex-1 btn-accent py-3 rounded-xl font-medium">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
