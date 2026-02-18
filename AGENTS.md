# Repository Guidelines

## Project Structure & Module Organization
The React + TypeScript app is bootstrapped by `main.tsx` and routed through `src/App.tsx`. Role-specific experiences sit in `src/admin` and `src/client`, each containing `layout/` shells and `pages/` screens; keep new admin or client pages beside their layouts to preserve lazy-loading boundaries. Cross-cutting UI, mock data, and helpers belong in `src/shared/components`, `src/shared/data`, `src/shared/types`, and `src/shared/utils` so they can be reused by both surfaces. Static media and Tailwind layer definitions stay under `src/assets` and `src/index.css`, while deploy-ready artifacts are emitted to `dist/`. Use `public/` for files that must be copied verbatim (e.g., favicons, manifest) during the Vite build.

## Build, Test, and Development Commands
- `npm install` – sync dependencies declared in `package.json`.
- `npm run dev` – launch the Vite dev server with Fast Refresh at `http://localhost:5173`.
- `npm run build` – run the TypeScript project references (`tsconfig.*`) and output an optimized bundle to `dist/`.
- `npm run preview` – serve the build artifact locally for smoke testing.
- `npm run lint` – execute the ESLint flat config defined in `eslint.config.js` across all `.ts/.tsx` sources.

## Coding Style & Naming Conventions
Use 2-space indentation, TypeScript strict typing, and double quotes in TSX/TS files to match the existing codebase. Components and pages should be PascalCase (`LoanDashboard.tsx`), hooks camelCase (`useLoanFilters`), and shared utility modules kebab-case or camelCase depending on their export style. Tailwind is configured via `tailwind.config.js`; prefer utility classes over ad-hoc CSS and colocate component-scoped styles in the relevant `.tsx` file. Run `npm run lint` and resolve every warning before submitting.

## Testing Guidelines
A formal automated test harness is not yet wired up; until Vitest/React Testing Library are introduced, cover changes with targeted manual verification (screenshots or short Loom links are welcome) and include regression checklists in PRs. When you add automated tests, place them next to the unit under test as `ComponentName.test.tsx`, mock network calls with Axios interceptors, and gate merges on the custom `npm run test` script you introduce.

## Commit & Pull Request Guidelines
Recent history follows conventional commits (`feat:`, `chore:`, `skills setup`)—continue using an imperative prefix plus a concise scope (e.g., `feat(admin): add loan KPI chart`). Keep commits focused and reference any GitHub issue IDs in the body. Pull requests should describe the change, list manual/automated test evidence, call out affected routes (`/admin` vs `/client`), and attach UI screenshots for visual updates. Request review from at least one maintainer before merging.
