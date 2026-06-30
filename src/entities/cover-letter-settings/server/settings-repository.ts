import "server-only";

import {
  COVER_LETTER_SETTINGS_REDIS_KEY,
  coverLetterSettingsFormToJson,
  coverLetterSettingsJsonToForm,
  createDefaultCoverLetterSettingsJson,
  normalizeCoverLetterSettings,
} from "@/entities/cover-letter-settings";
import type {
  CoverLetterSettingsForm,
  CoverLetterSettingsJson,
  CoverLetterSettingsState,
} from "@/entities/cover-letter-settings";
import { getRedis } from "@/shared/api/upstash";

export async function getCoverLetterSettings(): Promise<CoverLetterSettingsState> {
  const redis = getRedis();

  if (!redis) {
    return buildCoverLetterSettingsState(
      createDefaultCoverLetterSettingsJson(),
      "template",
    );
  }

  const storedJson = await redis.get<unknown>(COVER_LETTER_SETTINGS_REDIS_KEY);

  if (!storedJson) {
    return buildCoverLetterSettingsState(
      createDefaultCoverLetterSettingsJson(),
      "template",
    );
  }

  return buildCoverLetterSettingsState(
    normalizeCoverLetterSettings(storedJson),
    "redis",
  );
}

export async function saveCoverLetterSettings(
  settings: CoverLetterSettingsForm,
): Promise<CoverLetterSettingsState> {
  const settingsJson = coverLetterSettingsFormToJson(settings);

  await saveCoverLetterSettingsJson(settingsJson);

  return {
    ...buildCoverLetterSettingsState(settingsJson, "redis"),
    updatedAt: new Date().toISOString(),
  };
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

async function saveCoverLetterSettingsJson(settings: CoverLetterSettingsJson) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  await redis.set(COVER_LETTER_SETTINGS_REDIS_KEY, settings);
  const storedSettings = normalizeCoverLetterSettings(
    await redis.get<unknown>(COVER_LETTER_SETTINGS_REDIS_KEY),
  );

  if (JSON.stringify(storedSettings) !== JSON.stringify(settings)) {
    throw new Error("Не удалось подтвердить сохранение настроек письма.");
  }
}
