import "server-only";

import { randomUUID } from "node:crypto";

import {
  COVER_LETTER_HISTORY_REDIS_KEY,
  addCoverLetterHistoryItem,
  createCoverLetterHistoryItem,
  createDefaultCoverLetterHistoryJson,
  getCoverLetterHistoryRedisKey,
  normalizeCoverLetterHistory,
} from "@/entities/cover-letter-history";
import type {
  CoverLetterHistoryJson,
  CoverLetterHistoryState,
  CreateCoverLetterHistoryItemInput,
} from "@/entities/cover-letter-history";
import { isOwnerEmail, normalizeAuthEmail } from "@/entities/auth";
import { getRedis } from "@/shared/api/upstash";

export async function getCoverLetterHistory(
  email: string,
): Promise<CoverLetterHistoryState> {
  const userEmail = normalizeAuthEmail(email);
  const redis = getRedis();

  if (!redis) {
    return buildCoverLetterHistoryState(
      createDefaultCoverLetterHistoryJson(),
      "template",
    );
  }

  const userHistoryKey = getCoverLetterHistoryRedisKey(userEmail);
  const storedJson = await redis.get<unknown>(userHistoryKey);

  if (storedJson) {
    return buildCoverLetterHistoryState(
      normalizeCoverLetterHistory(storedJson),
      "redis",
    );
  }

  const migratedHistory = await readOwnerHistoryMigration(userEmail);

  if (migratedHistory) {
    await saveCoverLetterHistoryJson(userEmail, migratedHistory);

    return buildCoverLetterHistoryState(migratedHistory, "redis");
  }

  return buildCoverLetterHistoryState(
    createDefaultCoverLetterHistoryJson(),
    "template",
  );
}

export async function addGeneratedCoverLetterToHistory(
  email: string,
  input: CreateCoverLetterHistoryItemInput,
) {
  const userEmail = normalizeAuthEmail(email);
  const currentHistory = await getCoverLetterHistory(userEmail);
  const item = createCoverLetterHistoryItem({
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });
  const historyJson = addCoverLetterHistoryItem(
    { schemaVersion: 4, items: currentHistory.history },
    item,
  );

  await saveCoverLetterHistoryJson(userEmail, historyJson);

  return {
    item,
    ...buildCoverLetterHistoryState(historyJson, "redis"),
    updatedAt: new Date().toISOString(),
  };
}

export async function clearCoverLetterHistory(
  email: string,
): Promise<CoverLetterHistoryState> {
  const userEmail = normalizeAuthEmail(email);
  const historyJson = createDefaultCoverLetterHistoryJson();

  await saveCoverLetterHistoryJson(userEmail, historyJson);

  return {
    ...buildCoverLetterHistoryState(historyJson, "redis"),
    updatedAt: new Date().toISOString(),
  };
}

async function readOwnerHistoryMigration(email: string) {
  const redis = getRedis();

  if (!redis || !isOwnerEmail(email)) {
    return null;
  }

  const defaultHistory = await redis.get<unknown>(COVER_LETTER_HISTORY_REDIS_KEY);

  return defaultHistory ? normalizeCoverLetterHistory(defaultHistory) : null;
}

function buildCoverLetterHistoryState(
  historyJson: CoverLetterHistoryJson,
  source: CoverLetterHistoryState["source"],
): CoverLetterHistoryState {
  return {
    history: historyJson.items,
    source,
  };
}

async function saveCoverLetterHistoryJson(
  email: string,
  history: CoverLetterHistoryJson,
) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  const userHistoryKey = getCoverLetterHistoryRedisKey(email);

  await redis.set(userHistoryKey, history);
  const storedHistory = normalizeCoverLetterHistory(
    await redis.get<unknown>(userHistoryKey),
  );

  if (JSON.stringify(storedHistory) !== JSON.stringify(history)) {
    throw new Error("Не удалось подтвердить сохранение истории писем.");
  }
}
