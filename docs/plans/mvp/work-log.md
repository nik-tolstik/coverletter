# Work Log

## 2026-06-30

- Created an empty Next.js + TypeScript project with pnpm.
- Pushed the initial scaffold to `git@github.com:nik-tolstik/coverletter.git`.
- Added product description to `README.md`.
- Added technical documentation for the profile model, prompt flow, and shadcn setup.
- Added Next.js best practices documentation.
- Added implementation plan files under `docs/plans/mvp`.
- Recorded OpenRouter with `openai/gpt-5.4-mini` as the MVP AI provider/model choice.
- Added the canonical MVP Markdown profile structure in `docs/profile-markdown.md`.
- Replaced `localStorage` as the profile source of truth with Upstash Redis through Vercel Marketplace.
- Clarified that Upstash Redis is used as durable storage without TTL, not as an ephemeral cache.
- Removed the local Redis setup; the app now uses one Upstash Redis database through Vercel-provided REST variables.

## Next

- Apply shadcn preset `b6CyQSoHBY`.
- Create a simple project directory structure.
- Implement the first generator workspace screen.
