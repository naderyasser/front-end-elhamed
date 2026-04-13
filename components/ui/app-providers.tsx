"use client";

import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "@/contexts/notification-context";
import { CartProvider } from "@/contexts/CartContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <NotificationProvider>
                <CartProvider>{children}</CartProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}
