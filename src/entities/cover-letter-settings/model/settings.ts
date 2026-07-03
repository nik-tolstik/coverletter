import { getUserScopedRedisKey } from "@/entities/auth";

export const COVER_LETTER_SETTINGS_REDIS_KEY =
  "cover-letter-settings:default:json";

export function getCoverLetterSettingsRedisKey(email: string) {
  return getUserScopedRedisKey("cover-letter-settings", email, "json");
}

export const DEFAULT_COVER_LETTER_LANGUAGE = "English";

export const MESSAGE_FORMAT_VALUES = ["email", "message"] as const;

export type MessageFormat = (typeof MESSAGE_FORMAT_VALUES)[number];

export const DEFAULT_MESSAGE_FORMAT: MessageFormat = "email";

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
    value: "deepseek/deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    tier: "pro",
    priceLabel: "$0.435 / $0.87",
  },
  {
    value: DEFAULT_OPENROUTER_MODEL,
    label: "GPT-5.4 Mini",
    tier: "balanced",
    priceLabel: "$0.75 / $4.50",
  },
  {
    value: "openai/gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    tier: "balanced",
    priceLabel: "$0.20 / $1.25",
  },
  {
    value: "anthropic/claude-sonnet-5",
    label: "Claude Sonnet 5",
    tier: "balanced",
    priceLabel: "$2 / $10",
  },
  {
    value: "deepseek/deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    tier: "balanced",
    priceLabel: "$0.089 / $0.18",
  },
  {
    value: "qwen/qwen3.7-plus",
    label: "Qwen3.7 Plus",
    tier: "balanced",
    priceLabel: "$0.32 / $1.28",
  },
  {
    value: "nvidia/nemotron-3-nano-30b-a3b:free",
    label: "Nemotron 3 Nano 30B Free",
    tier: "free",
    priceLabel: "$0 / $0",
  },
] as const;

export const COVER_LETTER_TENSE_RULE =
  'Для английских писем текущий интерес, мотивацию и готовность обсудить роль писать в настоящем времени: "I\'m interested...", "I\'m excited about..." или "This role caught my attention because..."; не писать "I was interested...".';

const LEGACY_DEFAULT_COVER_LETTER_RULES = [
  "Обращаться к компании и роли, если их можно понять из вакансии.",
  "Начинать с прямой причины интереса и соответствия роли.",
  COVER_LETTER_TENSE_RULE,
  "Упомянуть 2-4 самых релевантных факта из профиля.",
  "Если требования нет в профиле, упоминать только смежный реальный опыт.",
  "Предпочитать конкретные проектные примеры общим формулировкам.",
  "Закончить коротким уверенным завершением.",
  "Вывести только текст письма.",
];

const FLAT_DEFAULT_COVER_LETTER_RULES = [
  "Start with a polite neutral greeting.",
  COVER_LETTER_TENSE_RULE,
  "Mention the position and company if they are clear from the vacancy.",
  "Say why this vacancy caught my attention.",
  "Connect the role with my relevant experience.",
  "End politely and simply.",
  "If the contact person's name is known, address them by name.",
  'For Russian letters, if the contact person\'s name is unknown, use "Здравствуйте!" or "Добрый день!".',
  'Do not use casual greetings such as "Привет" or "Приветствую".',
  'Do not start with "Откликаюсь на позицию...".',
  'Use simple opening phrases such as "Меня заинтересовала вакансия...", "Пишу вам по поводу вакансии...", or "Увидел вашу вакансию...".',
  "Write in a simple, human, professional tone.",
  "Avoid overly formal, bureaucratic, or corporate wording.",
  "Avoid phrases that sound too polished, dramatic, or artificial.",
  'Do not use obvious reasons such as "I like frontend", "I enjoy working on interfaces", or "this work is close to me".',
  "Explain interest through one concrete detail from the vacancy: product, tasks, stack, team, processes, responsibility, or domain.",
  'Keep the interest sentence simple: "Меня заинтересовало [specific detail from the vacancy], потому что у меня есть опыт в [relevant experience]."',
  "If there is little company context, explain interest through the role's tasks, not through generic enthusiasm.",
  'Avoid abstract phrases such as "interesting project", "promising company", "great team", "I want to grow", or "the work is close to me".',
  "Do not repeat the resume.",
  "Use only facts from the candidate profile and vacancy.",
  "Do not invent experience, metrics, technologies, employers, or achievements.",
  "Mention 2-4 relevant facts from my experience.",
  "Do not use generic phrases without specifics.",
  "Do not use bullet points inside the final letter.",
  "Keep the letter within 3-4 short paragraphs.",
  "Output only the letter text.",
  'End the letter in the same language as the final output. For Russian letters, use: "Буду рад обсудить, как могу быть полезен вашей команде. Спасибо вам и хорошего вам дня!" For English letters, use: "I would be glad to discuss how I can be useful to your team. Thank you, and have a great day!" Do not mix languages in the final letter.',
  "Mention technologies and back them up with facts.",
];

export const DEFAULT_COVER_LETTER_RULES = [
  "Structure:",
  "1. Start with a polite neutral greeting.",
  COVER_LETTER_TENSE_RULE,
  "2. Mention the position and company if they are clear from the vacancy.",
  "3. Say why this vacancy caught my attention.",
  "4. Connect the role with my relevant experience.",
  "5. End politely and simply.",
  "Rules:",
  "- If the contact person's name is known, address them by name.",
  '- If the contact person\'s name is unknown, use "Здравствуйте!" or "Добрый день!".',
  '- Do not use casual greetings such as "Привет" or "Приветствую".',
  '- Do not start with "Откликаюсь на позицию...".',
  '- Use simple opening phrases such as "Меня заинтересовала вакансия...", "Пишу вам по поводу вакансии...", or "Увидел вашу вакансию...".',
  "- Write in a simple, human, professional tone.",
  "- Avoid overly formal, bureaucratic, or corporate wording.",
  "- Avoid phrases that sound too polished, dramatic, or artificial.",
  '- Do not use obvious reasons such as "I like frontend", "I enjoy working on interfaces", or "this work is close to me".',
  "- Explain interest through one concrete detail from the vacancy: product, tasks, stack, team, processes, responsibility, or domain.",
  '- Keep the interest sentence simple: "Меня заинтересовало [specific detail from the vacancy], потому что у меня есть опыт в [relevant experience]."',
  "- If there is little company context, explain interest through the role's tasks, not through generic enthusiasm.",
  '- Avoid abstract phrases such as "interesting project", "promising company", "great team", "I want to grow", or "the work is close to me".',
  "- Do not repeat the resume.",
  "- Use only facts from the candidate profile and vacancy.",
  "- Do not invent experience, metrics, technologies, employers, or achievements.",
  "- Mention 2-4 relevant facts from my experience.",
  "- Do not use generic phrases without specifics.",
  "- Do not use bullet points inside the final letter.",
  "- Keep the letter within 3-4 short paragraphs.",
  "- Output only the letter text.",
  '- End the letter in the same language as the final output. For Russian letters, use: "Буду рад обсудить, как могу быть полезен вашей команде. Спасибо вам и хорошего вам дня!" For English letters, use: "I would be glad to discuss how I can be useful to your team. Thank you, and have a great day!" Do not mix languages in the final letter.',
  COVER_LETTER_TENSE_RULE,
  "- Mention technologies and back them up with facts.",
];

export type CoverLetterSettingsForm = {
  model: string;
  language: string;
  messageFormat: MessageFormat;
  coverLetterRules: string[];
};

export type CoverLetterSettingsJson = CoverLetterSettingsForm & {
  schemaVersion: 5;
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
    messageFormat: DEFAULT_MESSAGE_FORMAT,
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
    messageFormat: settings.messageFormat,
    coverLetterRules: settings.coverLetterRules,
  };
}

export function coverLetterSettingsFormToJson(
  settings: CoverLetterSettingsForm,
): CoverLetterSettingsJson {
  return {
    schemaVersion: 5,
    model: normalizeOpenRouterModel(settings.model),
    language:
      writeLineValue(settings.language) || DEFAULT_COVER_LETTER_LANGUAGE,
    messageFormat: normalizeMessageFormat(settings.messageFormat),
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
    schemaVersion: 5,
    model: normalizeOpenRouterModel(readString(input.model)),
    language: readString(input.language) || DEFAULT_COVER_LETTER_LANGUAGE,
    messageFormat: normalizeMessageFormat(input.messageFormat),
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

export function normalizeMessageFormat(
  input: unknown,
  fallback: MessageFormat = DEFAULT_MESSAGE_FORMAT,
): MessageFormat {
  return MESSAGE_FORMAT_VALUES.includes(input as MessageFormat)
    ? (input as MessageFormat)
    : fallback;
}

function normalizeCoverLetterRules(items: string[]) {
  const normalizedItems = normalizeRuleLines(items);

  if (!normalizedItems.length || isDefaultCoverLetterRules(normalizedItems)) {
    return DEFAULT_COVER_LETTER_RULES;
  }

  return ensureRules(normalizedItems, [COVER_LETTER_TENSE_RULE]);
}

function isDefaultCoverLetterRules(items: string[]) {
  return [
    LEGACY_DEFAULT_COVER_LETTER_RULES,
    FLAT_DEFAULT_COVER_LETTER_RULES,
    DEFAULT_COVER_LETTER_RULES,
  ].some((rules) => hasSameRules(items, rules));
}

function hasSameRules(items: string[], rules: string[]) {
  return (
    items.length === rules.length &&
    items.every((item, index) => item === rules[index])
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

function normalizeRuleLines(items: string[]) {
  return items.map(writeLineValue).filter(Boolean);
}

function deduplicateList(items: string[]) {
  return Array.from(new Set(items.map(writeLineValue).filter(Boolean)));
}

function readStringList(input: unknown) {
  if (Array.isArray(input)) {
    return input.map(readString).filter(Boolean);
  }

  if (typeof input === "string") {
    return input.split("\n").map(readString).filter(Boolean);
  }

  return [];
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function readString(input: unknown) {
  return typeof input === "string" ? writeLineValue(input) : "";
}

function writeLineValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
