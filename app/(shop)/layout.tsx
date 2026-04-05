import type { Metadata } from "next";
import "./shop-legacy.css";
import { ShopShell } from "@/components/shop/shop-shell";

export const metadata: Metadata = {
    title: "الحامد | المتجر",
    description: "متجر الحامد للمنتجات الفاخرة",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <ShopShell>{children}</ShopShell>;
}
