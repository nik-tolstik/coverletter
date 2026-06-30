import "server-only";

import {
  EMPTY_PROFILE_MARKDOWN,
  PROFILE_JSON_REDIS_KEY,
  PROFILE_MARKDOWN_REDIS_KEY,
  normalizeProfileJson,
  parseMarkdownToProfileJson,
  profileFormToJson,
  profileJsonToForm,
  profileJsonToMarkdown,
} from "@/entities/profile";
import type { ProfileFormState, ProfileJsonState, ProfileState } from "@/entities/profile";
import { getRedis } from "@/shared/api/upstash";

export async function getProfile(): Promise<ProfileState> {
  const redis = getRedis();

  if (!redis) {
    return buildProfileState(parseMarkdownToProfileJson(EMPTY_PROFILE_MARKDOWN), "template");
  }

  const storedJson = await redis.get<unknown>(PROFILE_JSON_REDIS_KEY);

  if (storedJson) {
    return buildProfileState(normalizeProfileJson(storedJson), "redis");
  }

  const storedMarkdown = await redis.get<string>(PROFILE_MARKDOWN_REDIS_KEY);

  if (!storedMarkdown) {
    return buildProfileState(parseMarkdownToProfileJson(EMPTY_PROFILE_MARKDOWN), "template");
  }

  const migratedProfile = parseMarkdownToProfileJson(storedMarkdown);
  await saveProfileJson(migratedProfile);
  await redis.del(PROFILE_MARKDOWN_REDIS_KEY);

  return buildProfileState(migratedProfile, "redis");
}

export async function saveProfile(
  profile: ProfileFormState,
): Promise<ProfileState> {
  const profileJson = profileFormToJson(profile);

  await saveProfileJson(profileJson);

  return {
    ...buildProfileState(profileJson, "redis"),
    updatedAt: new Date().toISOString(),
  };
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

async function saveProfileJson(profile: ProfileJsonState) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  await redis.set(PROFILE_JSON_REDIS_KEY, profile);
  const storedProfile = normalizeProfileJson(
    await redis.get<unknown>(PROFILE_JSON_REDIS_KEY),
  );

  if (JSON.stringify(storedProfile) !== JSON.stringify(profile)) {
    throw new Error("Не удалось подтвердить сохранение профиля.");
  }

  await redis.del(PROFILE_MARKDOWN_REDIS_KEY);
}
