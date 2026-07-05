# Storage Decision

## Decision

Use Upstash Redis from the Vercel Marketplace as the MVP database for auth users, the structured JSON profile, saved cover letter settings, and generated history. Use Vercel Blob Storage for uploaded profile avatars, while storing the resulting Blob URL in the Redis-backed profile JSON.

Why this is the simplest fit:

- The MVP stores a small set of JSON documents per user: auth user, structured profile, saved cover letter settings, and generated history.
- The data shape is one JSON object, so SQL schema and migrations would add unnecessary work.
- Vercel Marketplace can provision Upstash and inject environment variables into the project.
- `@upstash/redis` works well from Next.js Route Handlers and Server Actions.
- Upstash Redis is not treated as an ephemeral cache here: it provides durable persistent storage and backup/restore support.

## Runtime Target

Use one Upstash Redis database from Vercel for local development, preview, and production. This keeps the app simple and avoids maintaining a separate local database.

## Alternatives Considered

| Option | Fit For This MVP | Reason |
| --- | --- | --- |
| Vercel Blob | Not ideal | Better for files/uploads, not editing one profile as app state. |
| Edge Config | Not ideal | Optimized for config reads, not user-edited profile data. |
| Neon Postgres | Too much | Useful for relational data, but unnecessary for one profile document. |
| Supabase | Too much | Useful when auth, database, and storage are needed together. Too much for this personal app. |
| MongoDB Atlas | Good but heavier | Flexible documents, but more setup than a single Redis key. |
| Upstash Redis | Chosen | Smallest moving part for one editable JSON document. |

## MVP Data Model

Store the owner profile as one user-scoped JSON value:

```txt
profile:user:niko.tolstik%40gmail.com:json
```

Store the saved cover letter settings as one JSON value:

```txt
cover-letter-settings:user:niko.tolstik%40gmail.com:json
```

Store the generated cover letter history as one bounded JSON list:

```txt
cover-letter-history:user:niko.tolstik%40gmail.com:json
```

Store auth users separately:

```txt
auth:user:niko.tolstik%40gmail.com:json
```

The JSON value follows `ProfileJsonState`:

```json
{
  "schemaVersion": 7,
  "identity": {
    "avatarUrl": "",
    "name": "",
    "email": "niko.tolstik@gmail.com",
    "currentPosition": "",
    "experience": "",
    "location": "",
    "workFormats": ["Remote", "Hybrid"],
    "languages": [
      { "language": "Russian", "level": "Native" },
      { "language": "English", "level": "Upper-Intermediate" }
    ]
  },
  "skills": [
    {
      "name": "Frontend",
      "skills": ["React", "TypeScript", "Next.js"]
    }
  ],
  "experience": [
    {
      "companyName": "Acme Corp",
      "role": "Frontend Engineer",
      "employmentType": "Full-time",
      "dates": "2022-2025",
      "domain": "SaaS",
      "description": "Built product interfaces for customer-facing workflows.",
      "projects": [
        {
          "name": "Customer Portal",
          "role": "Frontend Engineer",
          "stack": "React, TypeScript, Next.js",
          "workDescription": "Built core product screens and integrated APIs."
        }
      ]
    }
  ],
  "projects": [
    {
      "name": "Coverletter",
      "role": "Author",
      "stack": "Next.js, TypeScript, Redis",
      "workDescription": "Built the profile editor and cover letter generation flow."
    }
  ]
}
```

Markdown is generated from JSON only when the AI prompt needs it.

The saved settings value stores reusable generation preferences. Vacancy text and additional wishes are current-generation inputs and are not saved here.

```json
{
  "schemaVersion": 5,
  "model": "openai/gpt-5.4-mini",
  "language": "English",
  "messageFormat": "email",
  "coverLetterRules": ["Вывести только текст письма."]
}
```

The generated history value stores the most recent letters, generation duration, and the parameters used to create them:

```json
{
  "schemaVersion": 4,
  "items": [
    {
      "id": "uuid",
      "createdAt": "2026-07-01T12:00:00.000Z",
      "title": "Frontend Engineer",
      "coverLetter": "Generated letter text",
      "generationDurationMs": 4200,
      "model": "openai/gpt-5.4-mini",
      "vacancyText": "Vacancy text",
      "language": "English",
      "additionalWishes": "",
      "messageFormat": "email",
      "coverLetterRules": ["Вывести только текст письма."]
    }
  ]
}
```

## Profile Source Flow

1. The app authenticates the user and normalizes the session email.
2. The app reads `profile:user:<encoded-email>:json` from Upstash Redis.
3. For `niko.tolstik@gmail.com` only, if the scoped JSON key does not exist, the app copies data from the legacy `profile:default:json` or `profile:default:markdown` key.
4. If neither key exists, the app uses the bundled empty template from `docs/profile-markdown.md` and converts it to JSON in memory.
5. The user edits the profile in the UI.
6. Saving writes the JSON object back to Upstash Redis under the scoped key.
7. Cover letter generation always uses Markdown generated from the current JSON profile.
8. The root page reads and writes saved cover letter settings from `cover-letter-settings:user:<encoded-email>:json`.

Local browser storage may be used only as a draft cache, not as the source of truth.

## Durability Notes

The concern with Redis is valid: self-hosted Redis is often used as an in-memory cache, and a misconfigured Redis instance can lose data after a restart.

For this project, the decision is specifically **Upstash Redis**, not an unmanaged ephemeral Redis cache. Upstash stores data in memory and on disk, provides persistent storage, and supports backup/restore. That makes it acceptable for the MVP's single JSON profile as long as:

- the profile key is written without an expiration/TTL,
- Redis is treated as the primary key-value database, not a cache,
- backups are enabled or created before important changes.

## Environment Variables

Upstash Redis through Vercel can provide Vercel KV-compatible variables:

```txt
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

`@upstash/redis` also supports the equivalent Upstash names, `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. This app accepts either pair.

Auth and email variables:

```txt
AUTH_SECRET=
AUTH_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Avatar upload variables:

```txt
BLOB_STORE_ID=
BLOB_READ_WRITE_TOKEN=
```

Avatar files are uploaded with private Blob access and delivered through the authenticated `/api/profile/avatar` route. This keeps the read-write token server-side and supports private Blob stores.

`AUTH_URL`, when configured, must be an absolute URL with a protocol, for example `https://coverletter.example.com`. Vercel's `VERCEL_URL` system variable contains only the host.

## Security Rules

- Keep Upstash credentials server-side only.
- Keep Blob Storage read/write tokens server-side only.
- Do not expose Redis URLs or tokens to Client Components.
- Do not log the full profile JSON, generated Markdown, or generation prompts.
- Keep profile, settings, history, and auth user reads/writes behind server routes.

## Implementation Notes

Install the SDK:

```zsh
pnpm add @upstash/redis
```

Initialize lazily:

```ts
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis() {
  if (!redis) {
    redis = Redis.fromEnv();
  }

  return redis;
}
```

Suggested placement:

```txt
src/
  entities/profile/
    model/
      constants.ts
      types.ts
    server/
      profile-repository.ts
  features/edit-profile/
  shared/api/upstash/
    redis.ts
```

## References

- [Redis on Vercel](https://vercel.com/docs/redis)
- [Upstash for Redis on Vercel Marketplace](https://vercel.com/marketplace/upstash/upstash-kv)
- [Upstash Durable Storage](https://upstash.com/docs/redis/features/durability)
- [Upstash Backup/Restore](https://upstash.com/docs/redis/features/backup)
- [Upstash Vercel Integration](https://upstash.com/docs/redis/howto/vercelintegration)
- [Upstash TypeScript deployment docs](https://upstash.com/docs/redis/sdks/ts/deployment)
