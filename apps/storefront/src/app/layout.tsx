import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNavbar } from "@/components/layout/mobile-bottom-navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE_NAME, SITE_URL, SITE_SLOGAN } from "@/lib/metadata";
import { query } from "@/lib/vendure/api";
import { GetActiveOrderQuery } from "@/lib/vendure/queries";
import { Suspense } from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} | ${SITE_SLOGAN}`,
        template: `%s | ${SITE_NAME}`,
    },
    description:
        "Park Picasso ile çocuk oyun parkları, açık hava spor ekipmanları ve bahçe mobilyalarında kaliteyi keşfedin. Her oyun, bir sanat eseri.",
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
            >
                <ThemeProvider>
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                    <Suspense>
                        <MobileBottomNavbar />
                    </Suspense>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
