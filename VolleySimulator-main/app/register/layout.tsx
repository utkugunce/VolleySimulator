import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kayıt Ol",
    description: "VolleySimulator'a ücretsiz kayıt olun. Voleybol maç tahminleri yapın, puan kazanın ve diğer taraftarlarla yarışın.",
    openGraph: {
        title: "Kayıt Ol | VolleySimulator",
        description: "VolleySimulator'a ücretsiz kayıt olun ve tahmin oyununa katılın.",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
