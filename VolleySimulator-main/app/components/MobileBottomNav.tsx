"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BarChart3, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    {
        href: "/ligler",
        label: "Maçlar",
        icon: Calendar,
        activePattern: /^\/(vsl|1lig|2lig|cev-cl|cev-cup|cev-challenge)\/(gunceldurum|tahminoyunu)/,
    },
    {
        href: "/leaderboard",
        label: "Sıralama",
        icon: BarChart3,
        activePattern: /^\/leaderboard/,
    },
    {
        href: "/quests",
        label: "Görevler",
        icon: Target,
        activePattern: /^\/quests/,
    },
    {
        href: "/profile",
        label: "Profil",
        icon: User,
        activePattern: /^\/(profile|login|register|ayarlar)/,
    },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 safe-area-pb">
            <div className="flex items-center justify-around h-16">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.activePattern.test(pathname || "");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "w-5 h-5 transition-transform",
                                    isActive && "scale-110"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[10px] font-bold",
                                    isActive && "text-primary"
                                )}
                            >
                                {item.label}
                            </span>
                            {isActive && (
                                <span className="absolute top-0 w-12 h-0.5 bg-primary rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
