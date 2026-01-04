export interface TeamTheme {
    primary: string;
    secondary: string;
    accent: string;
    logo?: string;
}

export const TEAM_THEMES: Record<string, TeamTheme> = {
    "VakıfBank": {
        primary: "#ffcc00", // Gold
        secondary: "#000000", // Black
        accent: "#ffdd44"
    },
    "Eczacıbaşı Dynavit": {
        primary: "#ff6600", // Orange
        secondary: "#ffffff",
        accent: "#ff8844"
    },
    "Fenerbahçe Medicana": {
        primary: "#003366", // Navy
        secondary: "#ffed00", // Yellow
        accent: "#004488"
    },
    "Türk Hava Yolları": {
        primary: "#cc0000", // Red
        secondary: "#ffffff",
        accent: "#ee0000"
    },
    "Galatasaray Daikin": {
        primary: "#800000", // Maroon
        secondary: "#ffcc00", // Gold
        accent: "#a00000"
    },
    "Kuzeyboru": {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#333333"
    },
    "Zeren Spor": {
        primary: "#004488",
        secondary: "#ffffff",
        accent: "#0066aa"
    },
    "Aydın B.Ş.B.": {
        primary: "#003399",
        secondary: "#ffffff",
        accent: "#0055bb"
    },
    "Aras Kargo": {
        primary: "#ee3322",
        secondary: "#ffffff",
        accent: "#ff4433"
    },
    "Beşiktaş": {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#333333"
    },
    "Nilüfer Bld.": {
        primary: "#0066ff",
        secondary: "#ffffff",
        accent: "#3388ff"
    },
    "Sigorta Shop": {
        primary: "#ff0066",
        secondary: "#ffffff",
        accent: "#ff3388"
    },
    "Sarıyer Bld.": {
        primary: "#22aa44",
        secondary: "#ffffff",
        accent: "#33bb55"
    },
    "Bahçelievler Bld.": {
        primary: "#0088cc",
        secondary: "#ffffff",
        accent: "#22aacc"
    }
};

export const DEFAULT_THEME: TeamTheme = {
    primary: "#10b981", // Emerald
    secondary: "#0f172a", // Slate 900
    accent: "#34d399"
};

export function getTeamTheme(teamName: string | null): TeamTheme {
    if (!teamName) return DEFAULT_THEME;
    return TEAM_THEMES[teamName] || DEFAULT_THEME;
}
