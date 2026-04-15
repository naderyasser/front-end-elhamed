"use client";

import { useState, useEffect } from "react";

interface NewsletterConfigData {
    id?: number;
    title: string;
    subtitle: string;
    button_text: string;
    background_image: string;
    is_active: boolean;
}

const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce] text-right";

const DEFAULTS: NewsletterConfigData = {
    title: "اشترك في نشرتنا البريدية",
    subtitle: "احصل على أحدث العروض والمنتجات مباشرة في بريدك",
    button_text: "اشترك الآن",
    background_image: "",
    is_active: true,
};

export default function AdminNewsletterPage() {
    const [config, setConfig] = useState<NewsletterConfigData>(DEFAULTS);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/flask/admin/api/newsletter-config", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => {
                if (d?.config) setConfig(d.config);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const body = {
            title: fd.get("title"),
            subtitle: fd.get("subtitle"),
            button_text: fd.get("button_text"),
            background_image: fd.get("background_image") || "",
            is_active: config.is_active,
        };
        await fetch("/api/flask/admin/api/newsletter-config/save", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).catch(() => {});
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                <i className="bx bx-loader-alt bx-spin text-3xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16" dir="rtl">
            <div className="px-6 py-4 flex items-center gap-3 border-b bg-white sticky top-0 z-10 shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <i className="bx bx-envelope text-xl" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">قسم النشرة البريدية</h1>
                    <p className="text-gray-400 text-xs">إعدادات بنر الاشتراك في الصفحة الرئيسية</p>
                </div>
            </div>

            <div className="px-6 py-8 max-w-2xl">
                {saved && (
                    <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2">
                        <i className="bx bx-check-circle text-xl" /> تم الحفظ بنجاح
                    </div>
                )}

                <form onSubmit={handleSave} className="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">العنوان الرئيسي</label>
                        <input
                            name="title"
                            defaultValue={config.title}
                            className={inputCls}
                            placeholder="اشترك في نشرتنا البريدية"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">العنوان الفرعي</label>
                        <textarea
                            name="subtitle"
                            rows={2}
                            defaultValue={config.subtitle}
                            className={inputCls}
                            placeholder="احصل على أحدث العروض..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">نص زر الاشتراك</label>
                        <input
                            name="button_text"
                            defaultValue={config.button_text}
                            className={inputCls}
                            placeholder="اشترك الآن"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">صورة الخلفية (اختياري)</label>
                        <input
                            name="background_image"
                            defaultValue={config.background_image}
                            className={inputCls}
                            placeholder="/static/images/newsletter-bg.jpg"
                        />
                        {config.background_image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={config.background_image} alt="preview" className="mt-2 h-24 rounded-xl object-cover w-full" />
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-semibold text-gray-700">تفعيل القسم</p>
                            <p className="text-xs text-gray-400">إظهار أو إخفاء قسم النشرة البريدية</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setConfig((c) => ({ ...c, is_active: !c.is_active }))}
                            className={`relative w-14 h-7 rounded-full transition-colors ${config.is_active ? "bg-[#0071ce]" : "bg-gray-300"}`}
                        >
                            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${config.is_active ? "right-0.5" : "left-0.5"}`} />
                        </button>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 rounded-xl bg-[#0071ce] text-white font-bold text-base hover:bg-blue-700 transition-colors"
                        >
                            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                        </button>
                    </div>
                </form>

                <div className="mt-6 bg-white rounded-2xl shadow border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <i className="bx bx-show text-[#0071ce]" /> معاينة
                    </h3>
                    <div
                        className="rounded-xl p-8 text-center"
                        style={{ background: config.background_image ? `url(${config.background_image}) center/cover` : "linear-gradient(135deg, #0071ce 0%, #004a8f 100%)" }}
                    >
                        <p className="text-white text-xl font-bold mb-2">{config.title || "عنوان القسم"}</p>
                        <p className="text-white/80 text-sm mb-4">{config.subtitle || "الوصف"}</p>
                        <div className="flex max-w-xs mx-auto gap-2">
                            <input className="flex-1 rounded-lg px-3 py-2 text-sm" placeholder="بريدك الإلكتروني..." readOnly />
                            <button className="px-4 py-2 bg-white text-[#0071ce] rounded-lg text-sm font-bold">{config.button_text || "اشترك"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
