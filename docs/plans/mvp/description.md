# Implementation Plan

## Goal

Build a personal AI cover letter generator that uses a detailed structured JSON profile as the factual and stylistic source of truth.

This app is developed only for one person: me. Prefer the simplest direct implementation over scalable architecture, account systems, teams, roles, or multi-user abstractions.

## Milestones

1. Initialize UI foundation.
   - Apply shadcn preset `b6CyQSoHBY`.
   - Add shared UI primitives needed for forms, panels, tabs, alerts, and loading states.
   - Create a simple project directory structure.
   - Add Upstash Redis SDK and a lazy server-side Redis client.

2. Build profile editing.
   - Add a `/profile` page with a structured profile editor.
   - Seed it with the canonical template from `docs/profile-markdown.md`.
   - Load the profile from Redis key `profile:default:json`.
   - If Redis has no value, use the bundled template.
   - Store saved profile content in Redis without TTL/expiration.
   - Use the saved profile value as the source for generation.

3. Build generation settings.
   - Add vacancy text input.
   - Add language selection.
   - Add additional wishes input.
   - Validate required fields before generation.

4. Build prompt assembly.
   - Create domain helpers for system prompt and user prompt generation.
   - Keep prompt-building logic testable outside React.
   - Add a development-only prompt preview.

5. Add AI generation.
   - Add a server-side generation endpoint or Server Action.
   - Hide OpenRouter-specific code behind an adapter.
   - Use `openai/gpt-5.4-mini` as the default model.
   - Return generated text, loading state, and actionable errors.

6. Polish the product flow.
   - Add copy-to-clipboard.
   - Add regenerate.
   - Add empty/loading/error states.
   - Verify desktop and mobile layouts.

## Initial Folders

- `entities/profile`: profile Markdown, profile examples, parsing helpers if needed.
- `entities/cover-letter`: generated letter model and prompt contracts.
- `features/edit-profile`: Markdown editor and persistence.
- `features/generate-cover-letter`: submit flow and generation state.
- `widgets/generator-workspace`: main app workspace composition.
- `_pages/home`: root page composition imported by `src/app/page.tsx`.
- Route `/profile`: direct full-profile Markdown editing page.

## Defaults

- v1 persistence: Upstash Redis through Vercel Marketplace.
- v1 profile source: Redis key `profile:default:json`, with bundled empty template fallback.
- v1 profile structure: `docs/profile-markdown.md`.
- v1 interface language: Russian for all visible UI copy.
- v1 languages: Russian and English.
- v1 output: plain cover letter text.
- v1 authentication: none; this is a private single-user tool.
- v1 database: Upstash Redis.
- v1 durability expectation: persistent Upstash storage, no TTL on the profile key.
- AI provider: OpenRouter via server-side adapter.
- AI model: `openai/gpt-5.4-mini`, configurable with `OPENROUTER_MODEL`.
- AI credentials: `OPENROUTER_API_KEY` only on the server.

## Acceptance Criteria

- The root page provides one coherent cover letter generation workspace.
- The user can edit the structured profile and keep it between browsers/devices through Redis.
- The app does not require a checked-in personal profile file.
- The user can enter vacancy text, choose language, add wishes, and request generation.
- Generated letters never require client-side provider secrets.
- `pnpm lint` and `pnpm build` pass.
