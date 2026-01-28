"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'tr' | 'en';

interface LanguageContextType {
    language: Locale;
    setLanguage: (lang: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
    tr: {
        // Header
        // Header
        "nav.groups": "Gruplar",
        "nav.playoffs": "Playofflar",
        "nav.ranking": "Sıralama",
        "header.title": "CEV Şampiyonlar Ligi Tahmin Simülatörü",

        // Status Bar
        "status.groupIncomplete": "Grup Etabı Henüz Tamamlanmadı",
        "status.groupIncompleteDesc": "Sıralamalar ve eşleşmeler geçicidir. Kesin eşleşmeler için kalan maçları tahmin etmelisiniz.",
        "status.matchesRemaining": "maç kaldı",
        "status.completePredictions": "Tahminleri Tamamla",
        "status.autoFill": "Otomatik Doldur",
        "status.autoFillFavorites": "Favorilere Göre",
        "status.autoFillFavoritesDesc": "Sıralamaya göre",
        "status.autoFillRandom": "Rastgele",
        "status.autoFillRandomDesc": "Şansına bırak!",
        "guidance.rankings": "En iyi 3.ler ve detaylı genel sıralama için 'Sıralama' sekmesini kullanın.",

        "group.resetSim": "Simülasyonu Sıfırla",
        "group.resetConfirm": "Tüm grup tahminleriniz silinecektir. Emin misiniz?",
        "group.resetSuccess": "tahminleri sıfırlandı",
        "group.allReset": "Tüm tahminler sıfırlandı",

        // Playoff
        "playoff.po6": "Playoff 6",
        "playoff.po6Desc": "3 Maç • 2 Ayaklı",
        "playoff.qf": "Çeyrek Final",
        "playoff.qfDesc": "4 Maç • 2 Ayaklı",
        "playoff.f4": "Final Four",
        "playoff.f4Desc": "İstanbul • Tek Maç",
        "playoff.superFinal": "Süper Final",
        "playoff.superFinalDesc": "Şampiyonluk Savaşı",
        "playoff.match3rd": "3. Lük Maçı",
        "playoff.champion": "Şampiyon",
        "playoff.waiting": "Bekleniyor...",
        "playoff.goldenSet": "Altın Set",
        "playoff.singleMatch": "Tek Maç",
        "playoff.doubleLeg": "2 Ayaklı",
        "playoff.resetSim": "Simülasyonu Sıfırla",
        "playoff.resetConfirm": "Tüm Playoff tahminleri silinecek. Emin misiniz?",
        "playoff.leg1": "1. Maç",
        "playoff.leg2": "2. Maç",
        "playoff.score": "Skor",

        // Playoff Rules
        "rules.po6": "5 grup ikincisi ve en iyi grup üçüncüsü karşılaşır (2 Ayaklı).",
        "rules.qf": "5 grup birincisi direkt katılır + 3 Playoff 6 kazananı (2 Ayaklı).",
        "rules.f4": "Yarı Finaller ve Final, İstanbul'da tek maç üzerinden oynanır.",

        // Table
        "table.title": "Puan Durumu",
        "table.playoff": "Play-off",
        "table.playoffDesc": "İlk",
        "table.relegation": "Küme Düşme",
        "table.relegationDesc": "Son",
        "table.team": "Takım",
        "table.played": "OM",
        "table.won": "G",
        "table.lost": "M",
        "table.points": "P",
        "table.setsWon": "AS",
        "table.setsLost": "VS",
        "table.pointsWon": "ASP",
        "table.pointsLost": "VSP",

        // Fixture
        "fixture.upcoming": "Gelecek",
        "fixture.past": "Geçmiş",
        "fixture.matchNotFound": "maç bulunamadı",
        "fixture.matchSuffix": "maç",
        "fixture.relegation": "DÜŞME",
        "fixture.po": "PO",
        "fixture.played": "Oynandı",
        "fixture.unknownDate": "Tarih Belirtilmemiş",
        "fixture.days.0": "PAZAR",
        "fixture.days.1": "PAZARTESİ",
        "fixture.days.2": "SALI",
        "fixture.days.3": "ÇARŞAMBA",
        "fixture.days.4": "PERŞEMBE",
        "fixture.days.5": "CUMA",
        "fixture.days.6": "CUMARTESİ",

        // Ranking Table
        "ranking.1st": "1. Sıradaki Takımlar",
        "ranking.2nd": "2. Sıradaki Takımlar",
        "ranking.3rd": "3. Sıradaki Takımlar",
        "ranking.setRatio": "SO",
        "ranking.pointRatio": "SPO",

        // General
        "loading": "Yükleniyor...",
        "save": "Kaydet",
        "cancel": "İptal",
    },
    en: {
        // Header
        // Header
        "nav.groups": "Groups",
        "nav.playoffs": "Playoffs",
        "nav.ranking": "Rankings",
        "header.title": "CEV Champions League Prediction Simulator",

        // Status Bar
        "status.groupIncomplete": "Group Stage Incomplete",
        "status.groupIncompleteDesc": "Rankings and pairings are temporary. Predict remaining matches for final pairings.",
        "status.matchesRemaining": "matches left",
        "status.completePredictions": "Complete Predictions",
        "status.autoFill": "Auto Fill",
        "status.autoFillFavorites": "Favorites",
        "status.autoFillFavoritesDesc": "Based on ranking",
        "status.autoFillRandom": "Random",
        "status.autoFillRandomDesc": "Feeling lucky!",
        "guidance.rankings": "Check 'Rankings' tab for best 3rd placed teams and global standings.",

        "group.resetSim": "Reset Simulation",
        "group.resetConfirm": "All your group predictions will be deleted. Are you sure?",
        "group.resetSuccess": "predictions reset",
        "group.allReset": "All predictions reset",

        // Playoff
        "playoff.po6": "Playoff 6",
        "playoff.po6Desc": "3 Matches • 2 Legs",
        "playoff.qf": "Quarter Finals",
        "playoff.qfDesc": "4 Matches • 2 Legs",
        "playoff.f4": "Final Four",
        "playoff.f4Desc": "Istanbul • Single Match",
        "playoff.superFinal": "Super Final",
        "playoff.superFinalDesc": "OCampionship Battle",
        "playoff.match3rd": "Bronze Match",
        "playoff.champion": "Champion",
        "playoff.waiting": "Waiting...",
        "playoff.goldenSet": "Golden Set",
        "playoff.singleMatch": "Single Match",
        "playoff.doubleLeg": "2 Legs",
        "playoff.resetSim": "Reset Simulation",
        "playoff.resetConfirm": "All Playoff predictions will be deleted. Are you sure?",
        "playoff.leg1": "1st Leg",
        "playoff.leg2": "2nd Leg",
        "playoff.score": "Score",

        // Playoff Rules
        "rules.po6": "5 runners-up and best 3rd placed team meet (2 Legs).",
        "rules.qf": "5 pool winners qualify directly + 3 Playoff 6 winners (2 Legs).",
        "rules.f4": "Semi Finals and Final played in Istanbul as single matches.",

        // Table
        "table.title": "Standings",
        "table.playoff": "Play-off",
        "table.playoffDesc": "Top",
        "table.relegation": "Relegation",
        "table.relegationDesc": "Bottom",
        "table.team": "Team",
        "table.played": "P",
        "table.won": "W",
        "table.lost": "L",
        "table.points": "Pts",
        "table.setsWon": "SW",
        "table.setsLost": "SL",
        "table.pointsWon": "SPW",
        "table.pointsLost": "SPL",

        // Fixture
        "fixture.upcoming": "Upcoming",
        "fixture.past": "Past",
        "fixture.matchNotFound": "matches found",
        "fixture.matchSuffix": "matches",
        "fixture.relegation": "REL",
        "fixture.po": "PO",
        "fixture.played": "Finished",
        "fixture.unknownDate": "Unknown Date",
        "fixture.days.0": "SUNDAY",
        "fixture.days.1": "MONDAY",
        "fixture.days.2": "TUESDAY",
        "fixture.days.3": "WEDNESDAY",
        "fixture.days.4": "THURSDAY",
        "fixture.days.5": "FRIDAY",
        "fixture.days.6": "SATURDAY",

        // Ranking Table
        "ranking.1st": "1st Place Teams",
        "ranking.2nd": "2nd Place Teams",
        "ranking.3rd": "3rd Place Teams",
        "ranking.setRatio": "SR",
        "ranking.pointRatio": "SPR",

        // General
        "loading": "Loading...",
        "save": "Save",
        "cancel": "Cancel",
    }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Locale>('tr');

    // Load language preference
    useEffect(() => {
        const saved = localStorage.getItem('language') as Locale;
        if (saved && (saved === 'tr' || saved === 'en')) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Locale) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        const dict = translations[language] as Record<string, string>;
        return dict[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
