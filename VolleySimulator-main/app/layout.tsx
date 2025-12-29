import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";

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
      >
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
      </body>
    </html>
  );
}
