"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );
}
