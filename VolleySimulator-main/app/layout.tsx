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
import { OrganizationSchema, WebsiteSchema } from "./components/SEOSchema";
import { ThemeProvider } from "./context/ThemeContext";
import { FriendsProvider } from "./context/FriendsContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { QuestsProvider } from "./context/QuestsContext";
import { CustomLeaguesProvider } from "./context/CustomLeaguesContext";
import { LiveMatchProvider } from "./context/LiveMatchContext";
import { DynamicTeamTheme } from "./components/DynamicTeamTheme";
import { LevelUpModal } from "./components/ui/LevelUpModal";

import { ClientSideComponents } from "./components/ClientSideComponents";

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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://volleysimulator.com.tr';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VolleySimulator - Voleybol Tahmin ve Simülasyon Platformu",
    template: "%s | VolleySimulator",
  },
  description: "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu. Sultanlar Ligi, 1. Lig, 2. Lig ve CEV turnuvalarını takip edin.",
  keywords: [
    "voleybol",
    "voleybol tahmin",
    "Sultanlar Ligi",
    "voleybol simülasyon",
    "puan durumu",
    "playoff",
    "CEV Şampiyonlar Ligi",
    "Türkiye voleybol",
    "maç tahmini",
    "voleybol istatistikleri",
  ],
  authors: [{ name: "VolleySimulator" }],
  creator: "VolleySimulator",
  publisher: "VolleySimulator",
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
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: BASE_URL,
    siteName: "VolleySimulator",
    title: "VolleySimulator - Voleybol Tahmin ve Simülasyon Platformu",
    description: "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VolleySimulator - Voleybol Tahmin ve Simülasyon Platformu",
    description: "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu.",
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
  verification: {
    // Add your verification codes when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "tr-TR": BASE_URL,
      "en-US": `${BASE_URL}/en`,
    },
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
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider>
            <QueryProvider>
              <AuthProvider>
                <ThemeProvider>
                  <DynamicTeamTheme />
                  <LevelUpModal />
                  <NotificationsProvider>
                    <FriendsProvider>
                      <QuestsProvider>
                        <CustomLeaguesProvider>
                          <LiveMatchProvider>
                            <ToastProvider>
                              <Navbar />
                              <div className="pt-12 pb-16 min-h-screen flex flex-col">
                                <AuthGuard>
                                  {children}
                                </AuthGuard>
                              </div>
                            </ToastProvider>
                          </LiveMatchProvider>
                        </CustomLeaguesProvider>
                      </QuestsProvider>
                    </FriendsProvider>
                  </NotificationsProvider>
                </ThemeProvider>
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
                    // Registration successful
                  }, function(err) {
                    // Registration failed
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

        <ClientSideComponents />
      </body>
    </html>
  );
}
