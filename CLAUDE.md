# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CLIVO is the React front end of a clinic-management system for a software-reuse
course. The domain UI is written in Brazilian Portuguese (`lang="pt-BR"`, route
segments like `/clientes`, `/agenda`, `/financeiro`); code, identifiers and
documentation are in English. The backend lives in the sibling repository
`../clivo-api` and is the source of the OpenAPI spec this app generates against.

The whole point of the project is **variability**: one product serves dental,
physiotherapy and veterinary clinics without branching the code. Three mechanisms
carry that, each marked with a `Variability mechanism <X>` comment in the source:

- **A — module gating** (`src/features/capabilities/components/ModuleGate.tsx`):
  a screen region renders only when the clinic has the required modules active.
  Navigation entries carry the same `requires` marker
  (`src/features/navigation/model/navigation.ts`).
- **B — data-driven record sheets**
  (`src/features/encounters/components/fields/SheetFieldControl.tsx`): the
  encounter template arrives as a payload, so the same control renders an
  odontogram, a physiotherapy scale or a vet vital sign.
- **C — parameter-described editors**
  (`src/features/capabilities/model/parameter-editor.ts`): the API describes each
  parameter's accepted values in free text (`accepts`); the settings screen parses
  it and builds the matching control instead of hard-coding one per parameter.

Add a variation point by extending one of these mechanisms — do not add a
clinic-type conditional.

## Commands

```bash
pnpm dev              # vite dev server on :3000
pnpm build            # production build
pnpm preview          # serve the build
pnpm check            # biome lint + format check (run before committing)
pnpm lint             # biome lint only
pnpm format           # biome format --write
pnpm generate-api     # kubb: regenerate src/api/gen from ../clivo-api/openapi.json
pnpm generate-routes  # tsr generate: rewrite src/routeTree.gen.ts
```

There is no test runner in this project; `pnpm check` plus `npx tsc --noEmit` is
the verification loop, and `pnpm build` on top of it. The build does **not**
type-check — vite strips the types — so a contract change can build green and
still be broken; run `tsc` after every `pnpm generate-api`.

`VITE_API_URL` (see `.env.example`, default `http://localhost:8080`) is baked into
the generated axios clients as their `baseURL`.

## Architecture

**Three layers, one direction.** `routes/` → `features/` → `shared/` + `api/gen`.

- `src/routes/**` — TanStack Router file-based routes. Two surfaces live here:
  `_app` is the clinic-facing product, and `console/_console` is the platform
  administration console for the Clivo team (`/console`, signing in at
  `/console/entrar`, backed by `/api/platform/**` and the `platform` feature).
  Route files stay thin:
  they declare the route and point `component` at a feature component (see
  `src/routes/_app/agenda.tsx`). `_app.tsx` is the authenticated layout — it
  resolves the session in `beforeLoad`, redirects to `/login` on 401, and wraps
  everything in `AppShell`. `routeTree.gen.ts` is generated; never edit it.
- `src/features/<domain>/` — the actual application, split `components/`
  (React), `hooks/` (React Query composition over generated hooks) and `model/`
  (framework-free domain logic and value objects, e.g. `Capabilities`,
  `Modules`, `Parameters`).
- `src/shared/` — `ui/` design-system primitives (`Panel`, `Field`, `Button`,
  `Badge`, `Modal`, `EmptyState`, `Avatar`, plus `cn` and the `Tone` palette),
  `format/` pt-BR formatters for dates, money, national ids and names, and
  `api-error.ts`.
- `src/api/` — `client.ts` sets `withCredentials` (the API authenticates with a
  session cookie), `query-client.ts` builds the QueryClient (60s staleTime, no
  retry on 401/403).

**SSR is off.** The root route sets `ssr: false` and Vite runs
`tanstackStart({ spa: { enabled: true } })`; this is a client-rendered SPA against
a separate API.

### Generated API layer

`src/api/gen/` is produced by kubb from `../clivo-api/openapi.json` and is
**never edited by hand** — it is regenerated wholesale (`output.clean`) and is
excluded from Biome. It is grouped by OpenAPI tag into `types/`, `schemas/`
(zod), `clients/` (axios) and `hooks/` (React Query, with suspense variants).
Import through the barrels: `import { useSearchCustomers } from "#/api/gen/hooks"`.

Changing the API contract means editing the spec in `../clivo-api` and rerunning
`pnpm generate-api`. `kubb.config.ts` overrides int64 to `number` (the API sends
plain JSON numbers, not bigint) — keep that override when touching the config.

Errors surface as `ResponseError`; read them through `messageOf`, `violationsOf`
and `statusOf` in `src/shared/api-error.ts` rather than inspecting the error
shape inline. Generated query keys are objects (`{ url, params }`), so
invalidation predicates match on `queryKey[0].url` — see
`useAppointmentRefresh` in `src/features/appointments/hooks/use-appointment-actions.ts`.

## Conventions

- Imports use the `#/` alias for `src/` (`@/` also resolves, but `#/` is what the
  codebase uses); imports within a feature stay relative.
- Biome, tabs, double quotes, organize-imports on save. Run `pnpm check` before
  committing.
- Styling is Tailwind v4 configured entirely in `src/styles.css` via `@theme`;
  use the semantic tokens (`bg-surface`, `text-muted`, `border-line`,
  `bg-brand-soft`, …) and the `Tone` scale in `src/shared/ui/tone.ts` rather than
  raw palette colors.
- Domain models in `model/` are classes with private constructors and static
  `from(...)` factories exposing behavior, not getters (`Capabilities`,
  `Modules`, `Parameters`).
- User-visible strings are Portuguese; commit messages, comments and identifiers
  are English.

<!-- cortex:begin -->
## Cortex — decision memory

This project records its technical decisions with cortex (MCP server
`cortex`, tools: `save_decision`, `save_session_summary`,
`get_context`, `get_impact`, `search`, `search_all_projects`).

- Before proposing an approach or changing existing behavior, call
  `get_context` with your intent (or `search` with keywords) — a past
  decision may already govern this code.
- Before reworking code a decision anchors, call `get_impact` with the
  decision id to see everything the change touches.
- When the user confirms a non-obvious decision, save it with
  `save_decision`.
- When the session ends (or a milestone lands), persist an
  "Implemented / Decisions / Open" narrative with `save_session_summary`
  — the "Open" section is how the next session recovers unfinished work.
- Decision files live in `.cortex/decisions/` and are committed with the
  code they explain.
- If semantic search returns nothing useful, embeddings may be missing —
  suggest running `cortex embed --missing`.

More: https://github.com/lucasreali/cortex-cli#how-it-works
<!-- cortex:end -->
