# Coverletter

Coverletter is a personal AI assistant for generating tailored cover letters from a structured JSON profile. It is built as a one-person tool for my own job search, not as a multi-user product or scalable platform. The app keeps my experience, skills, projects, and achievements in one structured profile, then combines it with a vacancy description, language choice, message format, writing rules, and additional wishes to generate a focused cover letter.

## Product Idea

- Structured JSON profile with name, role, years of experience, social links, skills grouped by custom categories, and project-based experience.
- Profile and cover letter settings persistence in Upstash Redis through Vercel Marketplace.
- Cover letter settings: target language, vacancy text, message format, extra user wishes, and generation rules.
- AI prompt assembly that generates Markdown from the JSON profile and passes it as system context.
- OpenRouter as the AI gateway, with `openai/gpt-5.4-mini` as the default generation model.
- Simple feature folders to keep the personal app understandable.
- Russian-language UI for all visible application interface copy.
- shadcn/ui with preset `b6CyQSoHBY` for the interface.

## Documentation

- [Technical documentation](docs/technical.md)
- [Markdown profile structure](docs/profile-markdown.md)
- [Storage decision](docs/storage.md)
- [Next.js best practices](docs/nextjs-best-practices.md)
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

The app uses Upstash Redis through Vercel KV-compatible REST variables for the profile and saved letter settings:

```txt
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Use the write token, not the read-only token, because `/profile` saves the profile.

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
