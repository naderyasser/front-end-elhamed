"use client";

// Suggested path: app/admin/search-analytics/page.tsx
// Converted from: templates/admin/search_analytics.html

import { useState, useEffect } from "react";

interface SearchRow { query: string; cnt: number; avg_results?: number }

export default function AdminSearchAnalyticsPage() {
  const [topSearches, setTopSearches] = useState<SearchRow[]>([]);
  const [zeroResult, setZeroResult] = useState<SearchRow[]>([]);

  useEffect(() => {
    fetch("/api/flask/admin/api/search-analytics")
      .then((r) => r.json())
      .then((d) => { setTopSearches(d.top_searches ?? []); setZeroResult(d.zero_result ?? []); })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">تحليلات البحث</h1>
        <p className="text-gray-500 text-sm">إحصائيات استعلامات البحث والكلمات التي لا تجد نتائج</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <div className="admin-card p-5 rounded-xl" style={{ border: "1px solid #cfd8dc" }}>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="bx bx-trending-up text-red-500" /> أكثر عمليات البحث
          </h2>
          {topSearches.length === 0 ? (
            <p className="text-gray-500 text-center py-6">لا توجد بيانات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500" style={{ borderBottom: "1px solid #222" }}>
                    <th className="text-right pb-3 pr-2">#</th>
                    <th className="text-right pb-3">الكلمة</th>
                    <th className="text-center pb-3">عدد البحث</th>
                    <th className="text-center pb-3">متوسط النتائج</th>
                  </tr>
                </thead>
                <tbody>
                  {topSearches.map((row, i) => (
                    <tr key={i} className="hover:bg-white transition-colors" style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td className="py-2.5 pr-2 text-gray-500">{i + 1}</td>
                      <td className="py-2.5 text-gray-800 font-medium">
                        <a href={`/search?q=${encodeURIComponent(row.query)}`} className="hover:text-[#0071ce] transition-colors" target="_blank" rel="noreferrer">{row.query}</a>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="rounded-full text-xs font-bold px-2 py-0.5" style={{ background: "rgba(211,47,47,0.3)", color: "#f87171" }}>{row.cnt}</span>
                      </td>
                      <td className="py-2.5 text-center text-gray-500">{Math.round(row.avg_results ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Zero Result */}
        <div className="admin-card p-5 rounded-xl" style={{ border: "1px solid #cfd8dc" }}>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="bx bx-search-alt text-yellow-500" /> بحث بدون نتائج
          </h2>
          {zeroResult.length === 0 ? (
            <p className="text-gray-500 text-center py-6">لا توجد بيانات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500" style={{ borderBottom: "1px solid #222" }}>
                    <th className="text-right pb-3 pr-2">#</th>
                    <th className="text-right pb-3">الكلمة</th>
                    <th className="text-center pb-3">عدد مرات البحث</th>
                  </tr>
                </thead>
                <tbody>
                  {zeroResult.map((row, i) => (
                    <tr key={i} className="hover:bg-white transition-colors" style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td className="py-2.5 pr-2 text-gray-500">{i + 1}</td>
                      <td className="py-2.5 text-yellow-300 font-medium">{row.query}</td>
                      <td className="py-2.5 text-center">
                        <span className="rounded-full text-xs font-bold px-2 py-0.5" style={{ background: "rgba(234,179,8,0.3)", color: "#facc15" }}>{row.cnt}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
