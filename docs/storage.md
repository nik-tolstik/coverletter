# Storage Decision

## Decision

Use Upstash Redis from the Vercel Marketplace as the MVP database for the structured JSON profile and saved cover letter settings.

Why this is the simplest fit:

- The MVP stores two primary documents: the user's structured JSON profile and saved cover letter settings.
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

Store the profile as one JSON value:

```txt
profile:default:json
```

Store the saved cover letter settings as one JSON value:

```txt
cover-letter-settings:default:json
```

The JSON value follows `ProfileJsonState`:

```json
{
  "schemaVersion": 5,
  "identity": {
    "name": "",
    "currentPosition": "",
    "experience": "",
    "location": "",
    "workFormats": ["Remote", "Hybrid"],
    "languages": [
      { "language": "Russian", "level": "Native" },
      { "language": "English", "level": "B2" }
    ]
  },
  "skills": [
    {
      "name": "Frontend",
      "skills": ["React", "TypeScript", "Next.js"]
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

The saved settings value stores the current letter workflow fields:

```json
{
  "schemaVersion": 1,
  "language": "English",
  "vacancyText": "",
  "additionalWishes": "",
  "communicationStyle": ["Писать спокойно и по делу."],
  "coverLetterRules": ["Вывести только текст письма."]
}
```

## Profile Source Flow

1. The app reads `profile:default:json` from Upstash Redis.
2. If the JSON key does not exist, the app reads legacy `profile:default:markdown`, migrates it to JSON, and removes the legacy key after a confirmed save.
3. If neither key exists, the app uses the bundled empty template from `docs/profile-markdown.md` and converts it to JSON in memory.
4. The user edits the profile in the UI.
5. Saving writes the JSON object back to Upstash Redis.
6. Cover letter generation always uses Markdown generated from the current JSON profile.
7. The root page reads and writes saved cover letter settings from `cover-letter-settings:default:json`.

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

## Security Rules

- Keep Upstash credentials server-side only.
- Do not expose Redis URLs or tokens to Client Components.
- Do not log the full profile JSON, generated Markdown, or generation prompts.
- Keep profile reads and writes behind server routes.

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
