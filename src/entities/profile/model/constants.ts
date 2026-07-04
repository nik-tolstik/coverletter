import { getUserScopedRedisKey } from "@/entities/auth";

export const PROFILE_MARKDOWN_REDIS_KEY = "profile:default:markdown";
export const PROFILE_JSON_REDIS_KEY = "profile:default:json";

export function getProfileMarkdownRedisKey(email: string) {
  return getUserScopedRedisKey("profile", email, "markdown");
}

export function getProfileJsonRedisKey(email: string) {
  return getUserScopedRedisKey("profile", email, "json");
}

export const EMPTY_PROFILE_MARKDOWN = `# Profile

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
- Employment type:
- Dates:
- Domain:

#### Project: Project Name

- Role:
- Stack:
- What I did:

## Projects

### Project Name

- Role:
- Stack:
- What I did:
`;
