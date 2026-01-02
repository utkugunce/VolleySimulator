import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ToastProvider } from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import { QueryProvider } from "./providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
        suppressHydrationWarning
      >
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
                var s    = document.createElement('script');
                var h    = document.querySelector('head') || document.body;
                s.src    = 'https://acsbapp.com/apps/app/dist/js/app.js';
                s.async  = true;
                s.onload = function(){
                    acsbJS.init();
                };
                h.appendChild(s);
            })();
            `
          }}
        />
      </body>
    </html>
  );
}
