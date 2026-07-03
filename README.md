# Coverletter

Coverletter is a personal AI assistant for generating tailored cover letters from a structured JSON profile. It is built as a one-person tool for my own job search, not as a multi-user product or scalable platform. The app keeps my experience, skills, projects, and achievements in one structured profile, then combines it with a vacancy description, language choice, message format, writing rules, and additional wishes to generate a focused cover letter.

## Product Idea

- Structured JSON profile with name, role, years of experience, social links, skills grouped by custom categories, and project-based experience.
- Email/password authentication with Auth.js, confirmation and password reset emails through Resend.
- User-scoped profile, cover letter settings, and history persistence in Upstash Redis through Vercel Marketplace.
- Cover letter settings: target language, message format, model, and generation rules. Vacancy text and extra wishes are current-generation inputs, not saved settings.
- AI prompt assembly that generates Markdown from the JSON profile and passes it as system context.
- OpenRouter as the AI gateway, with `openai/gpt-5.4-mini` as the default generation model.
- Simple feature folders to keep the personal app understandable.
- Russian-language UI for all visible application interface copy.
- shadcn/ui with preset `b6CyQSoHBY` for the interface.

## Documentation

- [Technical documentation](docs/technical.md)
- [Markdown profile structure](docs/profile-markdown.md)
- [Storage decision](docs/storage.md)
- [Implementation plan](docs/plans/mvp/description.md)
- [Implementation prompt](docs/plans/mvp/prompt.md)
- [Work log](docs/plans/mvp/work-log.md)

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

The app uses Upstash Redis through Vercel KV-compatible REST variables for auth users, the profile, saved letter settings, and history:

```txt
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Use the write token, not the read-only token, because `/profile` saves the profile.

Authentication and transactional email:

```txt
AUTH_SECRET=
AUTH_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

`AUTH_URL` can be omitted locally when the request host is available. `RESEND_FROM_EMAIL` defaults to Resend's test sender if it is not configured.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- ESLint
