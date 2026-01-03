import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import { QueryProvider } from "./providers/QueryProvider";
import { LocaleProvider } from "./context/LocaleContext";

// Lazy load non-critical components (will be client-side only)
const ScrollToTop = dynamic(() => import("./components/ScrollToTop"));
const AccessiBeWidget = dynamic(() => import("./components/AccessiBeWidget"));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improve FCP by showing fallback font immediately
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only load when needed
});

export const viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "VolleySimulator",
  description: "Voleybol simülasyon ve tahmin platformu",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VolleySim",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider>
            <QueryProvider>
              <AuthProvider>
                <ToastProvider>
                  <Navbar />
                  <div className="pt-12 pb-16 min-h-screen flex flex-col">
                    <AuthGuard>
                      {children}
                    </AuthGuard>
                    <ScrollToTop />
                  </div>
                </ToastProvider>
              </AuthProvider>
            </QueryProvider>
          </LocaleProvider>
        </NextIntlClientProvider>
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="lazyOnload">
          {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
          `}
        </Script>

        <Analytics />
        <SpeedInsights />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C4T368HQ54"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-C4T368HQ54');
          `}
        </Script>

        {/* accessiBe Widget */}
        <AccessiBeWidget />
      </body>
    </html>
  );
}
