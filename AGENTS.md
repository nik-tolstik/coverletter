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
- Use `pnpm` for package management and scripts.
- Keep all code comments in English.

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
