// Sound effect utilities for gamification
"use client";

// Sound file paths
const SOUNDS = {
    click: '/sounds/click.mp3',
    scoreSelect: '/sounds/score-select.mp3',
    achievement: '/sounds/achievement.mp3',
    levelUp: '/sounds/levelup.mp3',
    victory: '/sounds/victory.mp3',
} as const;

type SoundName = keyof typeof SOUNDS;

// Audio cache to prevent reloading
const audioCache: Map<SoundName, HTMLAudioElement> = new Map();

// Check if sound is enabled from localStorage
function isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        const state = localStorage.getItem('volleySimGameState');
        if (state) {
            const parsed = JSON.parse(state);
            return parsed.soundEnabled !== false;
        }
    } catch {
        return true;
    }
    return true;
}

// Preload all sounds
export function preloadSounds(): void {
    if (typeof window === 'undefined') return;

    Object.entries(SOUNDS).forEach(([name, path]) => {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = 0.5;
        audioCache.set(name as SoundName, audio);
    });
}

// Play a sound effect
export function playSound(name: SoundName, volume = 0.5): void {
    if (typeof window === 'undefined') return;
    if (!isSoundEnabled()) return;

    try {
        // Get cached audio or create new
        let audio = audioCache.get(name);

        if (!audio) {
            const path = SOUNDS[name];
            if (!path) return;
            audio = new Audio(path);
            audioCache.set(name, audio);
        }

        // Clone to allow overlapping sounds
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = volume;
        clone.play().catch(() => {
            // Silently fail if autoplay is blocked
        });
    } catch {
        // Silently fail
    }
}

// Specific sound functions for convenience
export const sounds = {
    click: () => playSound('click', 0.3),
    scoreSelect: () => playSound('scoreSelect', 0.4),
    achievement: () => playSound('achievement', 0.6),
    levelUp: () => playSound('levelUp', 0.7),
    victory: () => playSound('victory', 0.5),
};
