"use client";

import { useEffect } from 'react';
import { useGameState } from '../utils/gameState';
import { getTeamTheme } from '../utils/team-themes';

export function DynamicTeamTheme() {
    const { gameState, isLoaded } = useGameState();

    useEffect(() => {
        if (!isLoaded) return;

        const teamTheme = getTeamTheme(gameState.favoriteTeam);
        const root = document.documentElement;

        if (gameState.favoriteTeam) {
            root.style.setProperty('--color-primary', teamTheme.primary);
            root.style.setProperty('--shadow-glow-primary', `0 0 20px ${teamTheme.primary}40`);
            root.style.setProperty('--color-primary-muted', `${teamTheme.primary}20`);
            // Add a flag for components to know a team theme is active
            root.setAttribute('data-team-theme', 'true');
        } else {
            // Revert to defaults (or remove)
            root.style.removeProperty('--color-primary');
            root.style.removeProperty('--shadow-glow-primary');
            root.style.removeProperty('--color-primary-muted');
            root.removeAttribute('data-team-theme');
        }
    }, [gameState.favoriteTeam, isLoaded]);

    return null;
}
