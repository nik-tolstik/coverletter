import {
  normalizeMessageFormat,
  type MessageFormat,
} from "@/entities/cover-letter-settings";

export const COVER_LETTER_HISTORY_REDIS_KEY =
  "cover-letter-history:default:json";

export const MAX_COVER_LETTER_HISTORY_ITEMS = 20;

const DEFAULT_HISTORY_MODEL = "openai/gpt-5.4-mini";

export type CoverLetterHistoryItem = {
  id: string;
  createdAt: string;
  title: string;
  coverLetter: string;
  generationDurationMs?: number;
  model: string;
  vacancyText: string;
  language: string;
  additionalWishes: string;
  messageFormat: MessageFormat;
  coverLetterRules: string[];
};

export type CoverLetterHistoryJson = {
  schemaVersion: 4;
  items: CoverLetterHistoryItem[];
};

export type CoverLetterHistoryState = {
  history: CoverLetterHistoryItem[];
  source: "redis" | "template";
  updatedAt?: string;
};

export type CreateCoverLetterHistoryItemInput = Omit<
  CoverLetterHistoryItem,
  "id" | "createdAt" | "title"
>;

export function createDefaultCoverLetterHistoryJson(): CoverLetterHistoryJson {
  return {
    schemaVersion: 4,
    items: [],
  };
}

export function normalizeCoverLetterHistory(
  input: unknown,
): CoverLetterHistoryJson {
  if (!isRecord(input)) {
    return createDefaultCoverLetterHistoryJson();
  }

  const items = Array.isArray(input.items)
    ? input.items.map(normalizeHistoryItem).filter(isHistoryItem)
    : [];

  return {
    schemaVersion: 4,
    items: deduplicateHistoryItems(items).slice(
      0,
      MAX_COVER_LETTER_HISTORY_ITEMS,
    ),
  };
}

export function createCoverLetterHistoryItem(
  input: CreateCoverLetterHistoryItemInput & {
    id: string;
    createdAt: string;
  },
): CoverLetterHistoryItem {
  const vacancyText = writeTextValue(input.vacancyText);

  return {
    id: writeLineValue(input.id),
    createdAt: writeLineValue(input.createdAt),
    title: buildHistoryTitle(vacancyText),
    coverLetter: writeTextValue(input.coverLetter),
    generationDurationMs: normalizeGenerationDuration(
      input.generationDurationMs,
    ),
    model: writeLineValue(input.model) || DEFAULT_HISTORY_MODEL,
    vacancyText,
    language: writeLineValue(input.language),
    additionalWishes: writeTextValue(input.additionalWishes),
    messageFormat: normalizeMessageFormat(input.messageFormat),
    coverLetterRules: deduplicateList(input.coverLetterRules),
  };
}

export function addCoverLetterHistoryItem(
  history: CoverLetterHistoryJson,
  item: CoverLetterHistoryItem,
): CoverLetterHistoryJson {
  return {
    schemaVersion: 4,
    items: deduplicateHistoryItems([item, ...history.items]).slice(
      0,
      MAX_COVER_LETTER_HISTORY_ITEMS,
    ),
  };
}

function normalizeHistoryItem(input: unknown): CoverLetterHistoryItem | null {
  if (!isRecord(input)) {
    return null;
  }

  const id = readString(input.id);
  const createdAt = readString(input.createdAt);
  const coverLetter = readText(input.coverLetter);
  const vacancyText = readText(input.vacancyText);
  const language = readString(input.language);

  if (!id || !createdAt || !coverLetter || !vacancyText || !language) {
    return null;
  }

  return {
    id,
    createdAt,
    title: readString(input.title) || buildHistoryTitle(vacancyText),
    coverLetter,
    generationDurationMs: normalizeGenerationDuration(
      input.generationDurationMs,
    ),
    model: readString(input.model) || DEFAULT_HISTORY_MODEL,
    vacancyText,
    language,
    additionalWishes: readText(input.additionalWishes),
    messageFormat: normalizeMessageFormat(input.messageFormat),
    coverLetterRules: deduplicateList(readStringList(input.coverLetterRules)),
  };
}

function isHistoryItem(
  input: CoverLetterHistoryItem | null,
): input is CoverLetterHistoryItem {
  return input !== null;
}

function buildHistoryTitle(vacancyText: string) {
  const firstLine = vacancyText
    .split("\n")
    .map(writeLineValue)
    .find(Boolean);

  if (!firstLine) {
    return "Без названия";
  }

  return firstLine.length > 96 ? `${firstLine.slice(0, 93)}...` : firstLine;
}

function deduplicateHistoryItems(items: CoverLetterHistoryItem[]) {
  const seenIds = new Set<string>();
  const uniqueItems: CoverLetterHistoryItem[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) {
      continue;
    }

    seenIds.add(item.id);
    uniqueItems.push(item);
  }

  return uniqueItems.sort(
    (first, second) =>
      Date.parse(second.createdAt) - Date.parse(first.createdAt),
  );
}

function deduplicateList(items: string[]) {
  return Array.from(new Set(items.map(writeLineValue).filter(Boolean)));
}

function readStringList(input: unknown) {
  if (Array.isArray(input)) {
    return input.map(readString).filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split("\n")
      .map(readString)
      .filter(Boolean);
  }

  return [];
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function readString(input: unknown) {
  return typeof input === "string" ? writeLineValue(input) : "";
}

function normalizeGenerationDuration(input: unknown) {
  return typeof input === "number" && Number.isFinite(input) && input >= 0
    ? Math.round(input)
    : undefined;
}

function readText(input: unknown) {
  return typeof input === "string" ? writeTextValue(input) : "";
}

function writeLineValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function writeTextValue(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}
