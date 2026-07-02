import "server-only";

import { randomUUID } from "node:crypto";

import {
  COVER_LETTER_HISTORY_REDIS_KEY,
  addCoverLetterHistoryItem,
  createCoverLetterHistoryItem,
  createDefaultCoverLetterHistoryJson,
  normalizeCoverLetterHistory,
} from "@/entities/cover-letter-history";
import type {
  CoverLetterHistoryJson,
  CoverLetterHistoryState,
  CreateCoverLetterHistoryItemInput,
} from "@/entities/cover-letter-history";
import { getRedis } from "@/shared/api/upstash";

export async function getCoverLetterHistory(): Promise<CoverLetterHistoryState> {
  const redis = getRedis();

  if (!redis) {
    return buildCoverLetterHistoryState(
      createDefaultCoverLetterHistoryJson(),
      "template",
    );
  }

  const storedJson = await redis.get<unknown>(COVER_LETTER_HISTORY_REDIS_KEY);

  if (!storedJson) {
    return buildCoverLetterHistoryState(
      createDefaultCoverLetterHistoryJson(),
      "template",
    );
  }

  return buildCoverLetterHistoryState(
    normalizeCoverLetterHistory(storedJson),
    "redis",
  );
}

export async function addGeneratedCoverLetterToHistory(
  input: CreateCoverLetterHistoryItemInput,
) {
  const currentHistory = await getCoverLetterHistory();
  const item = createCoverLetterHistoryItem({
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });
  const historyJson = addCoverLetterHistoryItem(
    { schemaVersion: 2, items: currentHistory.history },
    item,
  );

  await saveCoverLetterHistoryJson(historyJson);

  return {
    item,
    ...buildCoverLetterHistoryState(historyJson, "redis"),
    updatedAt: new Date().toISOString(),
  };
}

export async function clearCoverLetterHistory(): Promise<CoverLetterHistoryState> {
  const historyJson = createDefaultCoverLetterHistoryJson();

  await saveCoverLetterHistoryJson(historyJson);

  return {
    ...buildCoverLetterHistoryState(historyJson, "redis"),
    updatedAt: new Date().toISOString(),
  };
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

async function saveCoverLetterHistoryJson(history: CoverLetterHistoryJson) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  await redis.set(COVER_LETTER_HISTORY_REDIS_KEY, history);
  const storedHistory = normalizeCoverLetterHistory(
    await redis.get<unknown>(COVER_LETTER_HISTORY_REDIS_KEY),
  );

  if (JSON.stringify(storedHistory) !== JSON.stringify(history)) {
    throw new Error("Не удалось подтвердить сохранение истории писем.");
  }
}
