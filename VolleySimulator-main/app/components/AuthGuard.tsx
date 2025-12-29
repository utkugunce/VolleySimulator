"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface AuthGuardProps {
    children: React.ReactNode;
}

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/register", "/auth/callback", "/oauth"];

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicPath = PUBLIC_PATHS.some(
        (path) => pathname === path || pathname?.startsWith("/auth/") || pathname?.startsWith("/oauth")
    );

    useEffect(() => {
        if (!loading && !user && !isPublicPath) {
            router.push("/login");
        }
    }, [user, loading, isPublicPath, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // If not authenticated and trying to access protected route, show nothing (will redirect)
    if (!user && !isPublicPath) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}
