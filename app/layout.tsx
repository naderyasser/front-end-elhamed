import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/ui/app-providers";
import { GlobalOverlays } from "@/components/ui/global-overlays";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "متجر الحمد",
  description: "متجر الحمد للاجهزة الكهربائية - شحن سريع لجميع أنحاء مصر",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/static/images/main-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`}>
        <AppProviders>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          {children}
          <GlobalOverlays />
        </AppProviders>
      </body>
    </html>
  );
}
