<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Agent Workflow

- Before starting implementation work, read `README.md` and the relevant project documentation in `docs/`.
- For broad product or architecture changes, start with `docs/technical.md`.
- For profile data, prompt context, or Markdown conversion changes, read `docs/profile-markdown.md`.
- For persistence, Redis, or environment variable changes, read `docs/storage.md`.
- For MVP planning context, read the relevant files in `docs/plans/mvp/`.
- Use `pnpm` for package management and scripts. Run project commands as `pnpm <command>` (for example, `pnpm lint` or `pnpm build`) unless a task explicitly requires pinning a package manager version.
- Keep all code comments in English.
- Do not use emoji in code, UI copy, documentation, comments, commits, or agent responses.
- Do not add descriptions for fields, blocks, or UI sections unless the user explicitly asks for them.
- Do not expose internal system details in user-facing errors, UI copy, API responses, toasts, or form messages. Details such as environment variable names, storage providers, Redis, Blob Storage, tokens, stack traces, provider internals, or infrastructure configuration must be replaced with a neutral message such as `Что-то пошло не так.`; keep the detailed cause only in server-side diagnostics when needed.
- Do not use borders or rings as decorative styling for new or changed UI elements unless the user explicitly asks for them. Prefer spacing, background contrast, opacity, shadow, and motion for hierarchy and interaction states.
- Add tasteful, lightweight animations for new or changed interactive and dynamic UI components whenever it improves clarity or perceived quality. Prefer existing project patterns such as Motion-based list/item transitions or simple CSS transitions, and keep animations subtle.
- Do not add `prefers-reduced-motion` or `motion-reduce` support unless the user explicitly asks for it.
- Verify work in a browser only when the user explicitly asks to check the result in a browser.
- When browser verification is explicitly requested, use the project Playwright setup with `pnpm test:e2e` or `pnpm exec playwright`; do not rely on a system Chrome path.

# Project Structure

```txt
src/
  app/          # Next.js App Router routes, layouts, and API route handlers
  _app/         # App-level providers and setup
  _pages/       # Route-level page compositions imported by src/app
  widgets/      # Larger reusable UI blocks
  features/     # User-facing actions such as generation and profile editing
  entities/     # Domain models, constants, repositories, and server logic
  shared/       # UI primitives, API clients, utilities, and shared helpers
docs/           # Product, technical, storage, profile, and planning docs
```
