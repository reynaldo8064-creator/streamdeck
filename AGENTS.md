# Project Guidance

## User Preferences

- IPTV / live TV channel browsing experience
- User communicates in Spanish; UI copy is in Spanish

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- caffeineai-oql 0.6.2: use .toEntityManual(name, typeName, primaryKey) plus one .payload(name, extract) per column when a record has a variant field or a field typed through a type alias; implicit _toRow derivation fails with M0230 for both.
- With --enhanced-migration, a stable actor field must be declared type-only and the migration's NewActor must list every stable field including accessControlState, initialized with AccessControl.initState().
- Seed data for a fresh Enhanced Migration project belongs in the first migration file's NewActor body, never in the actor body or pre/postupgrade. A migration file may import mops packages but never project modules.
- Seeded sample schedules must be anchored to Time.now() at migration time, not epoch 0, or time-window queries like now-playing always return null.
- Motoko has no triple-quoted multi-line string literal; author a long static Text as adjacent single-line literals joined with # and explicit \n escapes.
- TanStack Router validateSearch must declare every param the URL carries; undeclared params are stripped on the next navigate, so filter state written via history.replaceState is lost.
- Biome JSX-attribute suppressions must sit on the line immediately preceding the element they cover.
- Verified command sequence: mops install && mops check --fix from src/backend, then mops build from src/backend, then pnpm bindgen from the project root; frontend is pnpm typecheck, pnpm fix, pnpm build from src/frontend.
