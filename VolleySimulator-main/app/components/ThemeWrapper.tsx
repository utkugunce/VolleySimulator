"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "../context/ThemeContext";

export default function ThemeWrapper({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        Promise.resolve().then(() => {
            setMounted(true);
        });
        // Set initial theme from localStorage or default to dark
        const saved = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", saved);
    }, []);

    // Prevent flash by rendering children immediately but theme applies after mount
    return <ThemeProvider>{children}</ThemeProvider>;
}
