"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ThemeMode, AccentColor, UIPreferences, DashboardWidget } from "../types";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    accentColor: AccentColor;
    preferences: UIPreferences;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    setThemeMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    updatePreferences: (prefs: Partial<UIPreferences>) => void;
    updateDashboardLayout: (widgets: DashboardWidget[]) => void;
    playSound: (sound: SoundType) => void;
}

type SoundType = 'success' | 'error' | 'notification' | 'levelUp' | 'achievement' | 'click';

const defaultPreferences: UIPreferences = {
    theme: 'dark',
    accentColor: 'emerald',
    soundEffects: true,
    hapticFeedback: true,
    compactMode: false,
    showAnimations: true,
    fontSize: 'medium',
    dashboardLayout: [
        { id: 'standings', type: 'standings', position: 1, size: 'large', visible: true },
        { id: 'upcoming', type: 'upcoming', position: 2, size: 'medium', visible: true },
        { id: 'quests', type: 'quests', position: 3, size: 'small', visible: true },
        { id: 'streak', type: 'streak', position: 4, size: 'small', visible: true },
        { id: 'leaderboard', type: 'leaderboard', position: 5, size: 'medium', visible: true },
        { id: 'friends', type: 'friends', position: 6, size: 'medium', visible: true },
    ],
};

const SOUNDS: Record<SoundType, string> = {
    success: '/sounds/success.mp3',
    error: '/sounds/error.mp3',
    notification: '/sounds/notification.mp3',
    levelUp: '/sounds/level-up.mp3',
    achievement: '/sounds/achievement.mp3',
    click: '/sounds/click.mp3',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
    const [accentColor, setAccentColorState] = useState<AccentColor>("emerald");
    const [preferences, setPreferences] = useState<UIPreferences>(defaultPreferences);
    const [mounted, setMounted] = useState(false);
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        // Initialize system theme
        Promise.resolve().then(() => setSystemTheme(mediaQuery.matches ? 'dark' : 'light'));

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const saved = localStorage.getItem("theme") as Theme | null;
        const savedPrefs = localStorage.getItem("ui-preferences");

        if (saved) {
            Promise.resolve().then(() => {
                setThemeState(saved);
                document.documentElement.setAttribute("data-theme", saved);
            });
        }

        if (savedPrefs) {
            try {
                const prefs = JSON.parse(savedPrefs);
                Promise.resolve().then(() => {
                    setPreferences(prefs);
                    setThemeModeState(prefs.theme || 'dark');
                    setAccentColorState(prefs.accentColor || 'emerald');
                });
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    // Apply accent color as CSS variable
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        const colors: Record<AccentColor, string> = {
            emerald: '#10b981',
            blue: '#3b82f6',
            purple: '#8b5cf6',
            rose: '#f43f5e',
            amber: '#f59e0b',
            cyan: '#06b6d4',
        };
        root.style.setProperty('--accent-color', colors[accentColor]);

        // Apply font size
        const fontSizes = { small: '14px', medium: '16px', large: '18px' };
        root.style.setProperty('--base-font-size', fontSizes[preferences.fontSize]);
    }, [mounted, accentColor, preferences.fontSize]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        const newPrefs = { ...preferences, theme: mode };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));

        // Also update legacy theme
        const actualTheme = mode === 'system' ? systemTheme : mode;
        setTheme(actualTheme as Theme);
    }, [preferences, systemTheme]);

    const setAccentColor = useCallback((color: AccentColor) => {
        setAccentColorState(color);
        const newPrefs = { ...preferences, accentColor: color };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const updatePreferences = useCallback((prefs: Partial<UIPreferences>) => {
        const newPrefs = { ...preferences, ...prefs };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const updateDashboardLayout = useCallback((widgets: DashboardWidget[]) => {
        const newPrefs = { ...preferences, dashboardLayout: widgets };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const playSound = useCallback((sound: SoundType) => {
        if (!preferences.soundEffects) return;

        try {
            const audio = new Audio(SOUNDS[sound]);
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Ignore errors (e.g., user hasn't interacted with page yet)
            });
        } catch (err) {
            // Ignore sound errors
        }
    }, [preferences.soundEffects]);

    // Prevent flash of wrong theme
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            themeMode,
            accentColor,
            preferences,
            isDark,
            toggleTheme,
            setTheme,
            setThemeMode,
            setAccentColor,
            updatePreferences,
            updateDashboardLayout,
            playSound,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

// Hook for accent color classes
export function useAccentClasses() {
    const { accentColor } = useTheme();

    const classes: Record<AccentColor, {
        bg: string;
        bgHover: string;
        text: string;
        border: string;
        gradient: string;
    }> = {
        emerald: {
            bg: 'bg-emerald-500',
            bgHover: 'hover:bg-emerald-600',
            text: 'text-emerald-500',
            border: 'border-emerald-500',
            gradient: 'from-emerald-500 to-teal-500',
        },
        blue: {
            bg: 'bg-blue-500',
            bgHover: 'hover:bg-blue-600',
            text: 'text-blue-500',
            border: 'border-blue-500',
            gradient: 'from-blue-500 to-cyan-500',
        },
        purple: {
            bg: 'bg-purple-500',
            bgHover: 'hover:bg-purple-600',
            text: 'text-purple-500',
            border: 'border-purple-500',
            gradient: 'from-purple-500 to-pink-500',
        },
        rose: {
            bg: 'bg-rose-500',
            bgHover: 'hover:bg-rose-600',
            text: 'text-rose-500',
            border: 'border-rose-500',
            gradient: 'from-rose-500 to-red-500',
        },
        amber: {
            bg: 'bg-amber-500',
            bgHover: 'hover:bg-amber-600',
            text: 'text-amber-500',
            border: 'border-amber-500',
            gradient: 'from-amber-500 to-orange-500',
        },
        cyan: {
            bg: 'bg-cyan-500',
            bgHover: 'hover:bg-cyan-600',
            text: 'text-cyan-500',
            border: 'border-cyan-500',
            gradient: 'from-cyan-500 to-blue-500',
        },
    };

    return classes[accentColor];
}
