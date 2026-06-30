export const COVER_LETTER_SETTINGS_REDIS_KEY =
  "cover-letter-settings:default:json";

export const DEFAULT_COVER_LETTER_LANGUAGE = "English";

export const DEFAULT_COMMUNICATION_STYLE = [
  "Писать спокойно и по делу.",
  "Звучать уверенно, но без хайпа.",
  "Предпочитать конкретные проектные примеры.",
  "Избегать канцелярита, клише и общей восторженности.",
  "Держать абзацы короткими.",
];

export const DEFAULT_COVER_LETTER_RULES = [
  "Обращаться к компании и роли, если их можно понять из вакансии.",
  "Начинать с прямой причины интереса и соответствия роли.",
  "Упомянуть 2-4 самых релевантных факта из профиля.",
  "Если требования нет в профиле, упоминать только смежный реальный опыт.",
  "Предпочитать конкретные проектные примеры общим формулировкам.",
  "Закончить коротким уверенным завершением.",
  "Вывести только текст письма.",
];

export type CoverLetterSettingsForm = {
  language: string;
  vacancyText: string;
  additionalWishes: string;
  communicationStyle: string[];
  coverLetterRules: string[];
};

export type CoverLetterSettingsJson = CoverLetterSettingsForm & {
  schemaVersion: 1;
};

export type CoverLetterSettingsState = {
  settings: CoverLetterSettingsForm;
  source: "redis" | "template";
  updatedAt?: string;
};

export function createDefaultCoverLetterSettingsForm(): CoverLetterSettingsForm {
  return {
    language: DEFAULT_COVER_LETTER_LANGUAGE,
    vacancyText: "",
    additionalWishes: "",
    communicationStyle: DEFAULT_COMMUNICATION_STYLE,
    coverLetterRules: DEFAULT_COVER_LETTER_RULES,
  };
}

export function createDefaultCoverLetterSettingsJson(): CoverLetterSettingsJson {
  return coverLetterSettingsFormToJson(createDefaultCoverLetterSettingsForm());
}

export function coverLetterSettingsJsonToForm(
  settings: CoverLetterSettingsJson,
): CoverLetterSettingsForm {
  return {
    language: settings.language,
    vacancyText: settings.vacancyText,
    additionalWishes: settings.additionalWishes,
    communicationStyle: settings.communicationStyle,
    coverLetterRules: settings.coverLetterRules,
  };
}

export function coverLetterSettingsFormToJson(
  settings: CoverLetterSettingsForm,
): CoverLetterSettingsJson {
  return {
    schemaVersion: 1,
    language:
      writeLineValue(settings.language) || DEFAULT_COVER_LETTER_LANGUAGE,
    vacancyText: writeTextValue(settings.vacancyText),
    additionalWishes: writeTextValue(settings.additionalWishes),
    communicationStyle: normalizeListWithFallback(
      settings.communicationStyle,
      DEFAULT_COMMUNICATION_STYLE,
    ),
    coverLetterRules: normalizeListWithFallback(
      settings.coverLetterRules,
      DEFAULT_COVER_LETTER_RULES,
    ),
  };
}

export function normalizeCoverLetterSettings(
  input: unknown,
): CoverLetterSettingsJson {
  if (!isRecord(input)) {
    return createDefaultCoverLetterSettingsJson();
  }

  return {
    schemaVersion: 1,
    language: readString(input.language) || DEFAULT_COVER_LETTER_LANGUAGE,
    vacancyText: readText(input.vacancyText),
    additionalWishes: readText(input.additionalWishes),
    communicationStyle: normalizeListWithFallback(
      readStringList(input.communicationStyle),
      DEFAULT_COMMUNICATION_STYLE,
    ),
    coverLetterRules: normalizeListWithFallback(
      readStringList(input.coverLetterRules),
      DEFAULT_COVER_LETTER_RULES,
    ),
  };
}

function normalizeListWithFallback(items: string[], fallback: string[]) {
  const normalizedItems = deduplicateList(items);

  return normalizedItems.length ? normalizedItems : fallback;
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

function readText(input: unknown) {
  return typeof input === "string" ? writeTextValue(input) : "";
}

function writeLineValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function writeTextValue(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}
