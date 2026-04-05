"use client";

import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "@/contexts/notification-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <NotificationProvider>{children}</NotificationProvider>
        </ThemeProvider>
    );
}
