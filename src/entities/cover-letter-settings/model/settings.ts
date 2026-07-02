export const COVER_LETTER_SETTINGS_REDIS_KEY =
  "cover-letter-settings:default:json";

export const DEFAULT_COVER_LETTER_LANGUAGE = "English";

export const DEFAULT_USE_EMAIL_FORMAT = true;

export const DEFAULT_OPENROUTER_MODEL = "openai/gpt-5.4-mini";

export const OPENROUTER_MODEL_OPTIONS = [
  {
    value: "openai/gpt-5.4",
    label: "GPT-5.4",
    tier: "pro",
    priceLabel: "$2.50 / $15",
  },
  {
    value: "anthropic/claude-opus-4.8",
    label: "Claude Opus 4.8",
    tier: "pro",
    priceLabel: "$5 / $25",
  },
  {
    value: DEFAULT_OPENROUTER_MODEL,
    label: "GPT-5.4 Mini",
    tier: "balanced",
    priceLabel: "$0.75 / $4.50",
  },
  {
    value: "anthropic/claude-sonnet-5",
    label: "Claude Sonnet 5",
    tier: "balanced",
    priceLabel: "$2 / $10",
  },
  {
    value: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B Free",
    tier: "free",
    priceLabel: "$0 / $0",
  },
  {
    value: "qwen/qwen3-next-80b-a3b-instruct:free",
    label: "Qwen3 Next 80B Free",
    tier: "free",
    priceLabel: "$0 / $0",
  },
] as const;

export const COVER_LETTER_TENSE_RULE =
  'Для английских писем текущий интерес, мотивацию и готовность обсудить роль писать в настоящем времени: "I\'m interested...", "I\'m excited about..." или "This role caught my attention because..."; не писать "I was interested...".';

export const DEFAULT_COVER_LETTER_RULES = [
  "Обращаться к компании и роли, если их можно понять из вакансии.",
  "Начинать с прямой причины интереса и соответствия роли.",
  COVER_LETTER_TENSE_RULE,
  "Упомянуть 2-4 самых релевантных факта из профиля.",
  "Если требования нет в профиле, упоминать только смежный реальный опыт.",
  "Предпочитать конкретные проектные примеры общим формулировкам.",
  "Закончить коротким уверенным завершением.",
  "Вывести только текст письма.",
];

export type CoverLetterSettingsForm = {
  model: string;
  language: string;
  vacancyText: string;
  additionalWishes: string;
  useEmailFormat: boolean;
  coverLetterRules: string[];
};

export type CoverLetterSettingsJson = CoverLetterSettingsForm & {
  schemaVersion: 4;
};

export type CoverLetterSettingsState = {
  settings: CoverLetterSettingsForm;
  source: "redis" | "template";
  updatedAt?: string;
};

export function createDefaultCoverLetterSettingsForm(): CoverLetterSettingsForm {
  return {
    model: DEFAULT_OPENROUTER_MODEL,
    language: DEFAULT_COVER_LETTER_LANGUAGE,
    vacancyText: "",
    additionalWishes: "",
    useEmailFormat: DEFAULT_USE_EMAIL_FORMAT,
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
    model: normalizeOpenRouterModel(settings.model),
    language: settings.language,
    vacancyText: settings.vacancyText,
    additionalWishes: settings.additionalWishes,
    useEmailFormat: settings.useEmailFormat,
    coverLetterRules: settings.coverLetterRules,
  };
}

export function coverLetterSettingsFormToJson(
  settings: CoverLetterSettingsForm,
): CoverLetterSettingsJson {
  return {
    schemaVersion: 4,
    model: normalizeOpenRouterModel(settings.model),
    language:
      writeLineValue(settings.language) || DEFAULT_COVER_LETTER_LANGUAGE,
    vacancyText: writeTextValue(settings.vacancyText),
    additionalWishes: writeTextValue(settings.additionalWishes),
    useEmailFormat: settings.useEmailFormat,
    coverLetterRules: normalizeCoverLetterRules(settings.coverLetterRules),
  };
}

export function normalizeCoverLetterSettings(
  input: unknown,
): CoverLetterSettingsJson {
  if (!isRecord(input)) {
    return createDefaultCoverLetterSettingsJson();
  }

  return {
    schemaVersion: 4,
    model: normalizeOpenRouterModel(readString(input.model)),
    language: readString(input.language) || DEFAULT_COVER_LETTER_LANGUAGE,
    vacancyText: readText(input.vacancyText),
    additionalWishes: readText(input.additionalWishes),
    useEmailFormat: readBoolean(input.useEmailFormat, DEFAULT_USE_EMAIL_FORMAT),
    coverLetterRules: normalizeCoverLetterRules(
      readStringList(input.coverLetterRules),
    ),
  };
}

export function normalizeOpenRouterModel(model: string) {
  const normalizedModel = writeLineValue(model);

  return OPENROUTER_MODEL_OPTIONS.some(
    (option) => option.value === normalizedModel,
  )
    ? normalizedModel
    : DEFAULT_OPENROUTER_MODEL;
}

function normalizeCoverLetterRules(items: string[]) {
  return ensureRules(
    normalizeListWithFallback(items, DEFAULT_COVER_LETTER_RULES),
    [COVER_LETTER_TENSE_RULE],
  );
}

function ensureRules(items: string[], requiredRules: string[]) {
  const normalizedItems = deduplicateList(items);
  const existingRules = new Set(normalizedItems);

  return [
    ...normalizedItems,
    ...requiredRules.filter((rule) => !existingRules.has(rule)),
  ];
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

function readBoolean(input: unknown, fallback: boolean) {
  return typeof input === "boolean" ? input : fallback;
}

function writeLineValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function writeTextValue(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}
