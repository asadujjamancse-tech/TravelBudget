# AI Coding Rules — TravelBudget

These rules apply to every AI session working on this project.
Read them before making any change.

---

## Scope Rules

- **Only modify the files you are explicitly asked to change.**
  Updating a hotel card does not justify touching Navbar, AppContext, or any other file.
- **Do not refactor what isn't broken.**
  Fix the stated issue; don't clean up surrounding code unless asked.
- **Do not add features beyond what was requested.**
  One focused change > a bundle of related "improvements."

---

## Import Rules

- **Always use `@` path aliases** — never `../../data/countries` or similar.
  ```js
  ✅  import { countries } from '@data/countries'
  ❌  import { countries } from '../../data/countries'
  ```
- Relative imports are allowed **within the same feature folder** (sibling components).

---

## Styling Rules

- **Tailwind CSS only.** No inline `style={{}}` objects, no new CSS classes, no CSS modules.
- **Reuse the design system** — `.btn-primary`, `.card-hover`, `.glass`, `.input-base`, etc.
  Check `src/index.css` for the full list before creating a new class.
- **Preserve dark mode** — every new element needs `dark:` variants.
- **Mobile-first** — all layouts must work at 320px wide, then scale up.

---

## Component Rules

- **Check if a component already exists** before creating a new one.
  See the component inventory in `CLAUDE.md`.
- Every new component file must start with:
  ```js
  // FEATURE: <name>
  // PURPOSE: <one-line description>
  // DEPENDENCIES: <key imports>
  ```
- Components must be self-contained — no side effects outside their scope.

---

## State Rules

- **AppContext** is the only global store. Do not create parallel state systems.
- **localStorage** is accessed only via `useLocalStorage` hook.
- Feature-specific state lives inside the feature's own hook (e.g., `useExpenses`).

---

## Data Rules

- `src/data/countries.js` and `src/data/tips.js` are **source of truth**. Never duplicate data.
- To extend country data, add fields to `countries.js` — don't create shadow objects.
- The `getCountryById(id)` function is the canonical lookup — don't filter `countries` manually.

---

## Safety Rules

- **Build must pass** after every change — run `npm run build` to verify.
- **Never touch context files** unless the task is specifically about state management.
- **Lucide React v1.16.0** does NOT have: Twitter, Instagram, Youtube.
  Use: Share2, AtSign, Rss instead.
- **No API keys** hardcoded in source files — use `.env` variables.

---

## Git Rules

- Use descriptive branches: `feature/maps-clustering`, `fix/navbar-mobile`
- Commit messages follow: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`
- Never commit to `main` directly for large changes — use a branch.
