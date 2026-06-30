import "server-only";

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis() {
  const hasUpstashEnv =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasVercelKvEnv =
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

  if (!hasUpstashEnv && !hasVercelKvEnv) {
    return null;
  }

  if (!redis) {
    redis = Redis.fromEnv();
  }

  return redis;
}
