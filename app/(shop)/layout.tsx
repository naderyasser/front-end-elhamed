import type { Metadata } from "next";
import { Suspense } from "react";
import "./shop-legacy.css";
import { ShopShell } from "@/components/shop/shop-shell";
import PageTransitionLoader from "@/components/shop/page-transition-loader";

export const metadata: Metadata = {
    title: "الحمد | المتجر",
    description: "متجر الحمد للمنتجات الفاخرة",
    icons: {
        icon: "/favicon.ico",
    },
    alternates: {
        canonical: "https://alhamdshob.com/",
    },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ShopShell>{children}</ShopShell>
            <Suspense fallback={null}>
                <PageTransitionLoader />
            </Suspense>
        </>
    );
}
