# AGENTS.md — Nido Hack '26

## Project Overview

Student hackathon web app built at **Nido Hack '26**, Universidad del Desarrollo (April 10–11, 2026). Goal: ship a useful, creative web app in ~24 hours with the prompt "Getting There". Prioritize working features over perfection.

---

## Tech Stack

| Layer                     | Tool                             |
| ------------------------- | -------------------------------- |
| Runtime / Package Manager | Bun                              |
| Frontend Framework        | Nuxt.js (Vue 3, Composition API) |
| Frontend Styling          | Tailwind CSS v4                  |
| Build Tool                | Vite                             |

---

## Code Style

- **Language:** TypeScript everywhere. No `any` — use `unknown` and narrow it.
- **Vue components:** Use `<script setup lang="ts">`. One component per file.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for components/types, `kebab-case` for file names.
- **Functions:** Keep them short and single-purpose. If a function needs a comment to explain _what_ it does, split it up.
- **Imports:** Group in order — (1) Node/Bun built-ins, (2) external packages, (3) internal aliases (`~/`, `@/`). No default exports except Vue components and Nuxt pages.
- **No dead code.** Don't leave commented-out blocks behind — delete them.

---

## Architecture Rules

### Nuxt / Vue

- Pages go in `pages/`, reusable UI in `components/`, business logic in `composables/`.
- Fetch data in composables using `useFetch` or `useAsyncData` — not directly inside `<script setup>`.
- Keep components presentational when possible; let composables own state and side effects.

---

## How to Respond to Requests

1. **One change at a time.** Even if asked for multiple features, implement and explain them sequentially.
2. **State your edits upfront.** Begin with: _"Editing `path/to/file.ts` because …"_
3. **Explain new functions in plain language** — one sentence per function is enough.
4. **Flag breaking changes before making them.** If a change could affect layout, existing props, or the WASM API, say so first and propose a safe approach.
5. **Don't over-engineer.** This is a 24-hour hackathon. Prefer a clear, simple solution over a clever, abstract one.

---

## Do Not

- Do not install new dependencies without confirming with the team first.
- Do not modify `nuxt.config.ts` or `vite.config.ts` unless explicitly asked.
- Do not use `console.log` in committed code — use `useLogger()` or remove debug output.
- Do not write tests unless asked — we're shipping fast.
- Do not refactor working code while adding a feature.

---

## Quick Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server
bun run build        # Production build
```

> **After any change:** save the file, check the Vite HMR output in the terminal for errors, then verify in the browser. Commit early and often.
