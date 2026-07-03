import "server-only";

import {
  COVER_LETTER_SETTINGS_REDIS_KEY,
  coverLetterSettingsFormToJson,
  coverLetterSettingsJsonToForm,
  createDefaultCoverLetterSettingsJson,
  getCoverLetterSettingsRedisKey,
  normalizeCoverLetterSettings,
} from "@/entities/cover-letter-settings";
import type {
  CoverLetterSettingsForm,
  CoverLetterSettingsJson,
  CoverLetterSettingsState,
} from "@/entities/cover-letter-settings";
import { isOwnerEmail, normalizeAuthEmail } from "@/entities/auth";
import { getRedis } from "@/shared/api/upstash";

export async function getCoverLetterSettings(
  email: string,
): Promise<CoverLetterSettingsState> {
  const userEmail = normalizeAuthEmail(email);
  const redis = getRedis();

  if (!redis) {
    return buildCoverLetterSettingsState(
      createDefaultCoverLetterSettingsJson(),
      "template",
    );
  }

  const userSettingsKey = getCoverLetterSettingsRedisKey(userEmail);
  const storedJson = await redis.get<unknown>(userSettingsKey);

  if (storedJson) {
    return buildCoverLetterSettingsState(
      normalizeCoverLetterSettings(storedJson),
      "redis",
    );
  }

  const migratedSettings = await readOwnerSettingsMigration(userEmail);

  if (migratedSettings) {
    await saveCoverLetterSettingsJson(userEmail, migratedSettings);

    return buildCoverLetterSettingsState(migratedSettings, "redis");
  }

  return buildCoverLetterSettingsState(
    createDefaultCoverLetterSettingsJson(),
    "template",
  );
}

export async function saveCoverLetterSettings(
  email: string,
  settings: CoverLetterSettingsForm,
): Promise<CoverLetterSettingsState> {
  const userEmail = normalizeAuthEmail(email);
  const settingsJson = coverLetterSettingsFormToJson(settings);

  await saveCoverLetterSettingsJson(userEmail, settingsJson);

  return {
    ...buildCoverLetterSettingsState(settingsJson, "redis"),
    updatedAt: new Date().toISOString(),
  };
}

async function readOwnerSettingsMigration(email: string) {
  const redis = getRedis();

  if (!redis || !isOwnerEmail(email)) {
    return null;
  }

  const defaultSettings = await redis.get<unknown>(COVER_LETTER_SETTINGS_REDIS_KEY);

  return defaultSettings ? normalizeCoverLetterSettings(defaultSettings) : null;
}

function buildCoverLetterSettingsState(
  settingsJson: CoverLetterSettingsJson,
  source: CoverLetterSettingsState["source"],
): CoverLetterSettingsState {
  return {
    settings: coverLetterSettingsJsonToForm(settingsJson),
    source,
  };
}

async function saveCoverLetterSettingsJson(
  email: string,
  settings: CoverLetterSettingsJson,
) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  const userSettingsKey = getCoverLetterSettingsRedisKey(email);

  await redis.set(userSettingsKey, settings);
  const storedSettings = normalizeCoverLetterSettings(
    await redis.get<unknown>(userSettingsKey),
  );

  if (JSON.stringify(storedSettings) !== JSON.stringify(settings)) {
    throw new Error("Не удалось подтвердить сохранение настроек письма.");
  }
}
