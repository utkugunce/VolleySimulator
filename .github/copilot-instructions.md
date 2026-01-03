# VolleySimulator AI Coding Instructions

## Architecture Overview

This is a **monorepo** with two components:
- **`VolleySimulator-main/`**: Next.js 16 frontend (React 19, TypeScript, Tailwind CSS 4)
- **`go-backend/`**: Go Fiber API server for data serving and prediction storage

**Data Flow**: Frontend fetches league data from Go API (`/api/1lig`, `/api/vsl`, etc.) and persists user predictions to Supabase via Next.js API routes. The Go backend reads static JSON from `go-backend/data/` and handles protected endpoints with JWT auth.

## Key Conventions

### League Page Structure
Each league follows the same pattern under `app/{league}/`:
```
vsl/
├── gunceldurum/    # Current standings calculator
├── playoffs/       # Playoff bracket simulation
├── stats/          # Statistics view
└── tahminoyunu/    # Prediction game
```

Use **`LeagueTemplate`** components (`app/components/LeagueTemplate/`) with a `LeagueConfig` for consistent behavior. Theme colors are defined in `THEME_COLORS` - use existing themes: `red`, `amber`, `emerald`, `blue`, `rose`, `purple`.

### Types
All shared types live in `app/types.ts`. Key interfaces: `TeamStats`, `Match`, `MatchPrediction`, `SimulationResult`. Always import from here rather than defining locally.

### Scoring System (Volleyball-Specific)
Points awarded based on set results:
- **3-0, 3-1**: Winner gets 3 pts, loser 0 pts
- **3-2**: Winner gets 2 pts, loser gets 1 pt

See `getOutcomeFromScore()` in `app/utils/calculatorUtils.ts` for implementation.

### Match ID Format
Override keys use `{homeTeam}|||{awayTeam}` format (triple pipe separator). The legacy format `{homeTeam}-{awayTeam}` is also supported for compatibility.

### Team Name Normalization
Use `normalizeTeamName()` from `app/utils/calculatorUtils.ts` for consistent team matching. Handles Turkish characters (İ→I, ı→I).

## Supabase Patterns

- **Browser client**: `app/utils/supabase.ts` - returns `null` if unconfigured
- **Server client**: `app/utils/supabase-server.ts` - uses cookies for auth
- **Service role**: `createServiceRoleClient()` bypasses RLS (admin only)
- **Go backend**: Uses `SUPABASE_SERVICE_ROLE_KEY` for direct DB access

## API Routes
Next.js API routes in `app/api/` use Zod validation (see `app/api/predictions/route.ts`). Rate limiting via `createRateLimiter()` from `app/utils/rateLimit.ts`.

## i18n
Uses `next-intl` with Turkish (`tr`) as default locale. Messages in `messages/{tr,en}.json`. Access via `useTranslations()` hook.

## State Management
- **Server state**: TanStack React Query (`useLeagueQuery` hook)
- **Local scenarios**: `localStorage` with league-specific keys (e.g., `vsl-scenarios`)
- **Auth**: `AuthContext` with Supabase session management
- **Gamification**: `useGameState()` for XP, achievements, stats

## Commands

```bash
# Frontend (VolleySimulator-main/)
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run test         # Jest unit tests
npm run test:e2e     # Playwright e2e tests

# Backend (go-backend/)
go run main.go       # Start API server on :8080
docker build -t volleysim-api .
```

## Testing Conventions
- Unit tests: `__tests__/*.test.ts` - test utilities and hooks
- E2E tests: `e2e/*.spec.ts` - test user flows per feature
- Test match overrides use the `{homeTeam}|||{awayTeam}` format

## Environment Variables
Required in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=          # For Go backend JWT validation
```

## Common Gotchas
- Always check `isSupabaseConfigured` before Supabase operations
- Go backend serves static JSON from `data/` folder - must be copied in Docker builds
- Turkish team names require normalization for reliable matching
- Prediction routes support both single object and array payloads
