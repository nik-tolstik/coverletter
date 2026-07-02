# Technical Documentation

## Overview

Coverletter is a Next.js application that generates cover letters from a detailed personal JSON profile. It is developed as a private single-user tool for one person, not as a multi-user SaaS or scalable platform. The profile is the main source of truth for factual AI context: it contains experience, skills, projects, and career context. The user adds a vacancy description, selects a language, chooses a message format, adjusts writing rules, and provides optional extra wishes before generation.

## Current Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | shadcn/ui with preset `b6CyQSoHBY` |
| Interface language | Russian |
| Styling | Tailwind CSS 4 |
| AI gateway | OpenRouter |
| Default model | `openai/gpt-5.4-mini` |
| Database | Upstash Redis through Vercel Marketplace |
| Package manager | pnpm |
| File organization | Simple feature folders |
| Import alias | `@/*` -> `./src/*` |

## Product Model

The user profile is stored as structured JSON so form fields round-trip without Markdown parsing issues. Markdown is generated from that JSON only for the AI prompt.

The prompt-facing Markdown structure is documented in [Markdown profile structure](profile-markdown.md). The JSON source includes identity, links, skills, experience, and projects. Cover letter rules and message format are per-letter generation settings, not profile data.

Persisted cover letter settings:

- `model`: OpenRouter model used for generation.
- `language`: target output language, initially `ru` and `en`.
- `messageFormat`: output format selector value, either `email` or `telegram`.
- `coverLetterRules`: editable rules for the current letter.

Current generation inputs:

- `vacancyText`: job description or recruiter message.
- `additionalWishes`: free-form instructions from the user.
- `outputFormat`: plain cover letter text for v1.

Saved settings are persisted separately from the profile so the factual profile stays reusable while the current letter workflow can keep generation preferences between sessions. Vacancy text and additional wishes are not persisted as settings.

Generated cover letters are persisted as a bounded history list. Each entry stores the generated text, creation timestamp, vacancy text, language, message format, additional wishes, and rules used for that generation.

## Profile Source

MVP source flow:

1. The app reads the JSON profile from Upstash Redis.
2. If the JSON key does not exist, the app migrates legacy Markdown from `profile:default:markdown` when present.
3. If no saved profile exists, the app loads the bundled empty template from [Markdown profile structure](profile-markdown.md) and converts it to JSON in memory.
4. After the user edits and saves the profile, the current JSON object is written back to Upstash Redis.
5. Cover letter generation uses Markdown generated from the current saved JSON profile.
6. Browser `localStorage` may be used only as a draft cache, not as the source of truth.

Canonical Redis key:

```txt
profile:default:json
```

Canonical Redis key for saved cover letter settings:

```txt
cover-letter-settings:default:json
```

Canonical Redis key for generated cover letter history:

```txt
cover-letter-history:default:json
```

See [Storage decision](storage.md) for the full persistence plan. This keeps the MVP simple while avoiding a committed personal profile file.

## Project Structure

Next.js owns routing under `src/app`. The other folders are simple organizational buckets so the app stays readable without turning into a framework exercise.

Recommended structure:

```txt
src/
  app/          # Next.js route files, layouts, route handlers, metadata
  _app/         # Providers and app-level setup
  _pages/       # Route-level page compositions
  widgets/      # Larger UI blocks
  features/     # User actions: generate letter, edit profile
  entities/     # Profile and cover-letter domain code
  shared/       # UI primitives, lib helpers, config, API clients, types
```

Folder rules:

- `src/app` files stay thin and import route compositions from `src/_pages`.
- `shared/ui` contains shadcn-generated primitives and local wrappers.
- Keep domain logic outside React components when it makes the code easier to read.

## AI Prompt Flow

The system prompt should include:

- Markdown generated from the structured JSON profile.
- Writing rules from the current letter settings.
- Message format from the current letter settings.
- Safety rule: do not invent facts, metrics, employers, or achievements.
- Language/output rules.

The user prompt should include:

- Vacancy text.
- Selected language.
- Additional wishes.
- Cover letter rules for the current generation.
- Message format for the current generation.
- Any explicit constraints for the current letter.

Generation should be implemented behind a server boundary so provider keys never reach the browser. The initial implementation can use a Route Handler such as `src/app/api/cover-letter/route.ts` or a Server Action, with the provider hidden behind `src/shared/api/ai`.

Profile reads/writes should also stay behind a server boundary. There is no app-level account system because this is a private single-user tool.

## AI Provider

MVP provider choice:

- Gateway: OpenRouter.
- Model: `openai/gpt-5.4-mini`.
- API style: OpenAI-compatible chat completions.
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`.

Recommended environment variables:

```txt
KV_REST_API_URL=
KV_REST_API_TOKEN=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-5.4-mini
OPENROUTER_SITE_URL=
OPENROUTER_APP_TITLE=Coverletter
```

The Redis client also accepts `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; use whichever pair the Vercel integration provides.

Implementation rules:

- Keep all OpenRouter calls server-side.
- Store the API key only in environment variables.
- Use `Authorization: Bearer ${OPENROUTER_API_KEY}`.
- Send `HTTP-Referer` and `X-OpenRouter-Title` when `OPENROUTER_SITE_URL` and `OPENROUTER_APP_TITLE` are configured.
- Read the model from `OPENROUTER_MODEL`, defaulting to `openai/gpt-5.4-mini`.
- Keep provider code behind an adapter such as `src/shared/api/openrouter`.
- Return normalized application errors instead of leaking provider responses directly to the UI.

## UI Direction

Use shadcn/ui as the default interface system:

```zsh
pnpm dlx shadcn@latest init --preset b6CyQSoHBY --template next --base radix --force
```

Likely first components:

- `button`
- `textarea`
- `input`
- `select`
- `tabs`
- `card`
- `separator`
- `alert`
- `skeleton`
- `tooltip`

Primary screen layout:

- `/profile` page for editing the saved profile.
- Root page with vacancy/settings panel for language, message format, writing rules, additional wishes, and the current vacancy text.
- Generated cover letter preview with copy/regenerate actions.
- Keep all visible application UI copy in Russian.

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [OpenRouter Quickstart](https://openrouter.ai/docs/quickstart)
- [OpenRouter GPT-5.4 Mini](https://openrouter.ai/openai/gpt-5.4-mini)
- [Vercel Storage](https://vercel.com/docs/storage)
- [Upstash for Redis on Vercel](https://vercel.com/marketplace/upstash/upstash-kv)
- [Upstash local TypeScript development](https://upstash.com/docs/redis/sdks/ts/developing)
