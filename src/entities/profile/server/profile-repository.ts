import "server-only";

import {
  EMPTY_PROFILE_MARKDOWN,
  PROFILE_JSON_REDIS_KEY,
  PROFILE_MARKDOWN_REDIS_KEY,
  getProfileJsonRedisKey,
  getProfileMarkdownRedisKey,
  normalizeProfileJson,
  parseMarkdownToProfileJson,
  profileFormToJson,
  profileJsonToForm,
  profileJsonToMarkdown,
} from "@/entities/profile";
import type {
  ProfileFormState,
  ProfileJsonState,
  ProfileState,
} from "@/entities/profile";
import { isOwnerEmail, normalizeAuthEmail } from "@/entities/auth";
import { getRedis } from "@/shared/api/upstash";

export async function getProfile(email: string): Promise<ProfileState> {
  const userEmail = normalizeAuthEmail(email);
  const redis = getRedis();

  if (!redis) {
    return buildProfileState(
      parseMarkdownToProfileJson(EMPTY_PROFILE_MARKDOWN, userEmail),
      "template",
    );
  }

  const userJsonKey = getProfileJsonRedisKey(userEmail);
  const storedJson = await redis.get<unknown>(userJsonKey);

  if (storedJson) {
    return buildProfileState(
      normalizeProfileJson(storedJson, userEmail),
      "redis",
    );
  }

  const migratedProfile = await readOwnerProfileMigration(userEmail);

  if (migratedProfile) {
    await saveProfileJson(userEmail, migratedProfile);

    return buildProfileState(migratedProfile, "redis");
  }

  return buildProfileState(
    parseMarkdownToProfileJson(EMPTY_PROFILE_MARKDOWN, userEmail),
    "template",
  );
}

export async function saveProfile(
  email: string,
  profile: ProfileFormState,
): Promise<ProfileState> {
  const userEmail = normalizeAuthEmail(email);
  const profileJson = profileFormToJson({
    ...profile,
    identity: {
      ...profile.identity,
      email: profile.identity.email || userEmail,
    },
  });

  await saveProfileJson(userEmail, profileJson);

  return {
    ...buildProfileState(profileJson, "redis"),
    updatedAt: new Date().toISOString(),
  };
}

async function readOwnerProfileMigration(email: string) {
  const redis = getRedis();

  if (!redis || !isOwnerEmail(email)) {
    return null;
  }

  const userMarkdownKey = getProfileMarkdownRedisKey(email);
  const userMarkdown = await redis.get<string>(userMarkdownKey);

  if (userMarkdown) {
    return parseMarkdownToProfileJson(userMarkdown, email);
  }

  const defaultJson = await redis.get<unknown>(PROFILE_JSON_REDIS_KEY);

  if (defaultJson) {
    return normalizeProfileJson(defaultJson, email);
  }

  const defaultMarkdown = await redis.get<string>(PROFILE_MARKDOWN_REDIS_KEY);

  if (defaultMarkdown) {
    return parseMarkdownToProfileJson(defaultMarkdown, email);
  }

  return null;
}

function buildProfileState(
  profileJson: ProfileJsonState,
  source: ProfileState["source"],
): ProfileState {
  return {
    profile: profileJsonToForm(profileJson),
    markdown: profileJsonToMarkdown(profileJson),
    source,
  };
}

async function saveProfileJson(email: string, profile: ProfileJsonState) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  const userJsonKey = getProfileJsonRedisKey(email);
  const userMarkdownKey = getProfileMarkdownRedisKey(email);

  await redis.set(userJsonKey, profile);
  const storedProfile = normalizeProfileJson(
    await redis.get<unknown>(userJsonKey),
    email,
  );

  if (JSON.stringify(storedProfile) !== JSON.stringify(profile)) {
    throw new Error("Не удалось подтвердить сохранение профиля.");
  }

  await redis.del(userMarkdownKey);
}
