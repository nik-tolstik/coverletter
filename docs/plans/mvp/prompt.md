# Implementation Prompt

Build a Next.js + TypeScript application named Coverletter.

The product generates tailored cover letters from a detailed personal JSON profile. Markdown is generated from the JSON profile and passed to the AI as system context. The user provides cover letter writing rules and message format in the letter settings, adds a vacancy description, chooses the target language, and can add extra wishes for the current generation.

This is a single-user personal app for one person. Keep the implementation simple and direct. Do not design it as a multi-user SaaS, team product, or broadly scalable platform.

## Product Requirements

- The app must let the user maintain a detailed structured profile.
- The app must provide a `/profile` page where the user can edit the structured profile through form fields.
- The profile must follow the MVP structure from `docs/profile-markdown.md`.
- The profile must support identity, links, skills grouped by custom categories, experience by companies and projects with role/stack/free-form contribution, and standalone projects.
- The profile must be stored as structured JSON in Upstash Redis through Vercel Marketplace.
- On first visit, if Redis has no profile value, the profile editor must load the bundled empty template.
- After edits, the profile must be persisted to Redis under `profile:default:json` without TTL/expiration.
- Generation must use the saved profile value.
- The app must let the user enter vacancy text.
- The app must let the user choose the output language.
- The app must let the user choose the message format for the current generation.
- The app must let the user edit cover letter rules for the current generation.
- The app must let the user add optional extra wishes.
- The app must generate a cover letter that uses only facts from the profile and vacancy context.
- The app must avoid invented achievements, companies, metrics, and technologies.

## Technical Requirements

- Use Next.js App Router with TypeScript.
- Use simple feature folders under `src`.
- Keep Next route files in `src/app` thin.
- Use straightforward folders under `src/_app`, `src/_pages`, `src/widgets`, `src/features`, `src/entities`, and `src/shared`.
- Use shadcn/ui with preset `b6CyQSoHBY`.
- Use OpenRouter as the AI gateway.
- Use `openai/gpt-5.4-mini` as the default model.
- Use Upstash Redis as the MVP database.
- Treat Upstash Redis as durable storage, not as an expiring cache.
- Use pnpm for all package commands.
- Keep all visible application UI copy in Russian.
- Keep code comments in English.
- Keep AI provider calls server-side only.
- Keep Redis calls server-side only.
- Seed the profile editor with the full template from `docs/profile-markdown.md`.

## Suggested System Prompt Contract

```md
You are an assistant that writes precise, honest cover letters.

Use the candidate profile below as the source of truth.
Do not invent facts, employers, metrics, achievements, or technologies.
If the vacancy asks for something absent from the profile, connect only adjacent real experience and do not claim direct expertise.
Write in the requested language.
Follow the message format and cover letter rules from the current letter settings.
Keep the letter concise, specific, and relevant to the vacancy.

Candidate profile:

{{profileMarkdown}}

Cover letter rules:

- Address the company and role when they can be inferred from the vacancy.
- Start with a direct reason for interest and fit.
- Mention 2-4 strongest relevant experience points.
- Prefer concrete project outcomes over generic adjectives.
- End with a short confident closing.
- Output only the cover letter text.
```

## Suggested User Prompt Contract

```md
Target language: {{language}}

Additional wishes:
{{additionalWishes}}

Vacancy:
{{vacancyText}}
```
