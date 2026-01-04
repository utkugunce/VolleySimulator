// Utility functions bridge (deprecated, use app/lib paths instead)
export * from '../lib/core/apiValidation';
export * from '../lib/core/rateLimit';
export * from '../lib/core/validation';
export * from '../lib/core/performance';

// Re-export commonly used utilities
export { calculateLiveStandings, normalizeTeamName } from '../lib/calculation/calculatorUtils';
export { createClient } from '../lib/supabase/supabase';
export { generateTeamSlug, getTeamNameFromSlug, registerTeamSlug, isSlugRegistered } from '../lib/core/teamSlug';

// Data utils
export { getLeagueData } from '../lib/data/serverData';

// Game state
export { useGameState } from '../lib/game/gameState';
