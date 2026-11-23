# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page collection of Italian card/table games (Scopa, Scopone, Briscola, Scala 40, Sette e mezzo, Tombola, Poker, Klondike, FreeCell, Piramide, Orologio) against CPU opponents. React 19 + TypeScript + Vite + Tailwind v4 + framer-motion. No backend: all state lives in the browser. UI text and comments are in Italian; identifiers in English. `README.md` is the unmodified Vite template (it mentions Oxlint, which is not used).

## Commands

- `npm run dev` — dev server on port 3000
- `npm run build` — `tsc -b` type check + Vite build
- `npm run lint` — `biome check .` (Biome is the only linter/formatter: tabs, double quotes, organized imports)
- `npm run format` — `biome check --write .`
- `npm test` — Vitest, all tests
- Single test file: `npx vitest run src/games/scopa/scopa.test.ts`; single test: add `-t "<name>"`

## Architecture

Each game lives in `src/games/<game>/` and follows the same layering:

- `*Logic.ts` / `*Rules.ts` / `*Melds.ts` etc. — pure, immutable state transitions (`createGame`, `playCard`, …) on a serializable state object with a `phase` field. Tests (`*.test.ts`) target these pure modules only.
- `*Ai.ts` — CPU move choice, parameterized by `Difficulty`.
- `use<Game>.ts` — hook that owns the state via `useSavedGame`, drives CPU turns and animation pauses with `setTimeout` in `useEffect`s keyed on `phase`/current player.
- `<Game>.tsx` — presentational component built from shared pieces in `src/components/` (`Table`, `Hand`, `Opponent`, card views, `EventOverlay`, …).

Shared core (`src/core/`):

- `deck.ts` — Neapolitan (rank 1–10, 8/9/10 = Fante/Cavallo/Re) and French (1–13, jolly = suit `"jolly"` rank 0) cards.
- `settings.ts` — `GameId` union, `Settings` (persisted, always passed through `normalizeSettings` to fill fields missing from older versions), `saveKey`.
- `storage.ts` — `localStorage` JSON helpers with `cards-games:` prefix, failure-tolerant.
- `useSavedGame.ts` — autosaves game state each change; removed when `isFinished(state)`; `resume` reloads it. Because saves are restored from JSON, game state must stay plain serializable data.
- `gameEvents.ts` — capped event log in game state (`addEvent`), shown one at a time by `components/useEventQueue.ts`; events can carry opponent `moods`.

`App.tsx` routes between `MainMenu` and the selected game (no router). Scopa and Scopone share the same implementation via `variant`.

### Adding a game

Register it in: the `GameId` union and defaults in `core/settings.ts`, `MAX_CPU` and `GAMES` in `menu/MainMenu.tsx`, `RULES` in `menu/rules.ts`, and the switch in `App.tsx`.

Card images live in `public/cards/` (see `CREDITS.md`; excluded from Biome).
