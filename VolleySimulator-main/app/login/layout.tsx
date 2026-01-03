import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Giriş Yap",
    description: "VolleySimulator hesabınıza giriş yapın. Maç tahminleri yapın, puan kazanın ve liderlik tablosunda yerinizi alın.",
    openGraph: {
        title: "Giriş Yap | VolleySimulator",
        description: "VolleySimulator hesabınıza giriş yapın ve tahmin oyununa katılın.",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
