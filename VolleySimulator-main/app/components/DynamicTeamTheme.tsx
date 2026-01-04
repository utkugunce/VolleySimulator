"use client";

import { useEffect } from 'react';
import { useGameState } from '../utils/gameState';
import { getTeamTheme } from '../utils/team-themes';

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '16 185 129'; // fallback emerald
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

export function DynamicTeamTheme() {
    const { gameState, isLoaded } = useGameState();

    useEffect(() => {
        if (!isLoaded) return;

        const teamTheme = getTeamTheme(gameState.favoriteTeam);
        const root = document.documentElement;

        if (gameState.favoriteTeam) {
            // Set primary color and variants
            root.style.setProperty('--color-primary', teamTheme.primary);
            root.style.setProperty('--color-primary-rgb', hexToRgb(teamTheme.primary));
            root.style.setProperty('--shadow-glow-primary', `0 0 20px ${teamTheme.primary}40`);
            root.style.setProperty('--color-primary-muted', `${teamTheme.primary}20`);
            
            // Set secondary color for gradients
            root.style.setProperty('--color-secondary', teamTheme.secondary);
            root.style.setProperty('--color-secondary-rgb', hexToRgb(teamTheme.secondary));
            
            // Set accent color
            root.style.setProperty('--color-accent', teamTheme.accent);
            root.style.setProperty('--color-accent-rgb', hexToRgb(teamTheme.accent));
            
            // Add a flag for components to know a team theme is active
            root.setAttribute('data-team-theme', 'true');
        } else {
            // Revert to defaults (or remove)
            root.style.removeProperty('--color-primary');
            root.style.removeProperty('--color-primary-rgb');
            root.style.removeProperty('--shadow-glow-primary');
            root.style.removeProperty('--color-primary-muted');
            root.style.removeProperty('--color-secondary');
            root.style.removeProperty('--color-secondary-rgb');
            root.style.removeProperty('--color-accent');
            root.style.removeProperty('--color-accent-rgb');
            root.removeAttribute('data-team-theme');
        }
    }, [gameState.favoriteTeam, isLoaded]);

    return null;
}
