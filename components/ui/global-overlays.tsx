"use client";

import { usePathname } from "next/navigation";
import { TopProgress } from "@/components/ui/top-progress";
import { CommandPalette } from "@/components/ui/command-palette";
import { ChatWidget } from "@/components/ui/chat-widget";
import { NotificationToaster } from "@/components/ui/notification-toaster";

const SHOP_PREFIXES = [
    "/shop",
    "/about",
    "/cart",
    "/checkout",
    "/search",
    "/wishlist",
    "/return-policy",
    "/account",
    "/auth",
    "/orders",
    "/payment",
    "/order-confirmation",
    "/products",
];

export function GlobalOverlays() {
    const pathname = usePathname();
    const isShopRoute = SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (isShopRoute) {
        return null;
    }

    return (
        <>
            <TopProgress />
            <CommandPalette />
            <NotificationToaster />
            <ChatWidget />
        </>
    );
}
