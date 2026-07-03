# Markdown Profile Structure

The Markdown profile is the main factual source for cover letter generation. It should be detailed enough for the AI to select relevant evidence, but structured enough to discourage invented claims.

## Principles

- Write facts in first person or neutral resume style, but keep them concrete.
- Prefer project role, stack, and a concrete free-form contribution description over generic responsibility lists.
- Group skills by practical category and let experience, projects, and outcomes show depth.
- Keep all claims verifiable from the profile; if something is not in the profile, the generated letter must not claim it.
- Keep cover letter rules and message format in the letter settings, not in the profile.

## MVP Sections

Use this section order for v1:

1. `# Profile`
2. `## Identity`
3. `## Links`
4. `## Skills`
5. `## Experience`
6. `## Projects`

### Identity

Stable facts about the candidate.

```md
## Identity

- Name: Firstname Lastname
- Email: niko.tolstik@gmail.com
- Current position: Frontend Engineer
- Experience: X years as a Frontend Engineer
- Location: City, Country
- Work format: Remote, Hybrid
- Languages: Russian - Native, English - B2
```

### Links

Public links that can be mentioned or used for context.

```md
## Links

- GitHub: https://github.com/...
- LinkedIn: https://linkedin.com/in/...
- Portfolio: https://...
- Telegram: https://t.me/...
```

### Skills

Use custom categories that make scanning easy. Categories should describe where the skills are used, not a subjective level of mastery.

```md
## Skills

### Frontend

- React. Architecture, hooks, performance, complex forms, state management.
- TypeScript. Strict typing, domain models, API contracts.
- Next.js. App Router, routing, server/client boundaries, SSR.
- Tailwind CSS. Design systems, responsive layouts, component styling.

### Backend

- Node.js. API routes, scripts, integrations.
- PostgreSQL. Schema design, queries, persistence.
- Redis. Profile persistence, caching patterns.

### Testing and Tooling

- Playwright. End-to-end flows and regression checks.
- Vitest. Unit and integration tests.
- Docker. Local services and deployment packaging.
```

Recommended skill categories:

- `Frontend`: UI frameworks, styling, accessibility, forms, state management.
- `Backend`: API work, databases, queues, auth, integrations.
- `Testing`: unit, integration, E2E, QA automation.
- `DevOps`: CI/CD, hosting, containers, observability.
- `Product/AI`: domain-specific strengths such as prompt engineering or analytics.

### Experience

Company-level experience with project-level detail inside each company.

```md
## Experience

### Company Name

- Role: Frontend Engineer
- Dates: 2022-2025
- Domain: fintech / ecommerce / SaaS / internal tools
- Description:
  Built product interfaces for customer-facing and internal workflows.

#### Project: Project Name

- Role: Frontend Engineer
- Stack: React, TypeScript, Next.js, ...
- What I did:
  Built core product screens, improved form reliability, integrated APIs,
  and worked with product requirements from discovery to release.
```

### Projects

Standalone projects, side projects, open-source work, or projects that deserve more emphasis than company chronology.

```md
## Projects

### Project Name

- Role: Author / Frontend Engineer
- Stack: ...
- What I did:
  Designed the product flow, built the interface, connected persistence,
  and shipped the project as a usable tool.
```

## Optional Future Sections

These can be added after MVP without changing the core prompt contract:

- `## Achievements`: selected measurable wins across roles.
- `## Education`: degree, courses, certificates.
- `## Preferences`: industries, company size, work format, relocation.
- `## Anti-Preferences`: things to avoid in matching or wording.
- `## Keywords`: technologies, domains, and terms that should be easy to match.
- `## Examples Of My Writing`: short samples to imitate tone.

## Full Template

```md
# Profile

## Identity

- Name:
- Email:
- Current position:
- Experience:
- Location:
- Work format:
- Languages:

## Links

- GitHub:
- LinkedIn:
- Portfolio:
- Telegram:

## Skills

### Category Name

-

## Experience

### Company Name

- Role:
- Dates:
- Domain:
- Description:

#### Project: Project Name

- Role:
- Stack:
- What I did:

## Projects

### Project Name

- Role:
- Stack:
- What I did:
```
