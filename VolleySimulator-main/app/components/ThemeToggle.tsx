"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
        const initialTheme = saved || 'dark';
        setTheme(initialTheme);
        applyTheme(initialTheme);
    }, []);

    function applyTheme(newTheme: 'dark' | 'light') {
        document.documentElement.setAttribute('data-theme', newTheme);
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(newTheme);
    }

    function toggleTheme() {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }

    if (!mounted) return null;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            aria-label="Toggle theme"
            className="h-9 w-9"
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    );
}
