import { getUserScopedRedisKey } from "@/entities/auth";
import {
  DEFAULT_OPENROUTER_MODEL,
  normalizeOpenRouterModel,
} from "@/shared/api/openrouter/models";

export {
  DEFAULT_OPENROUTER_MODEL,
  OPENROUTER_MODEL_OPTIONS,
  normalizeOpenRouterModel,
} from "@/shared/api/openrouter/models";

export const COVER_LETTER_SETTINGS_REDIS_KEY =
  "cover-letter-settings:default:json";

export function getCoverLetterSettingsRedisKey(email: string) {
  return getUserScopedRedisKey("cover-letter-settings", email, "json");
}

export const DEFAULT_COVER_LETTER_LANGUAGE = "English";
export const COVER_LETTER_LANGUAGE_VALUES = ["Russian", "English"] as const;

export type CoverLetterLanguage = (typeof COVER_LETTER_LANGUAGE_VALUES)[number];

export const MESSAGE_FORMAT_VALUES = ["message"] as const;

export type MessageFormat = (typeof MESSAGE_FORMAT_VALUES)[number];

export const DEFAULT_MESSAGE_FORMAT: MessageFormat = "message";

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
  "Do not restate the profile.",
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

const MIXED_DEFAULT_COVER_LETTER_RULES = [
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
  "- Do not restate the profile.",
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

export const ENGLISH_COVER_LETTER_RULES = [
  "Structure:",
  '1. Start the first paragraph with a polite neutral greeting, add "Your vacancy for [vacancy role] caught my attention.", and introduce who I am in the same paragraph.',
  COVER_LETTER_TENSE_RULE,
  "2. In the second paragraph, describe one primary relevant project or company with 2-3 strongest matches to the vacancy.",
  "3. Add at most one short sentence about adjacent experience only if it directly supports the vacancy requirements.",
  "4. Do not add a separate generic usefulness paragraph; if usefulness is worth mentioning, make it concrete and part of the relevant experience.",
  "5. End with the fixed closing phrase as the final paragraph.",
  "Rules:",
  "- If the contact person's name is known, address them by name.",
  '- If the contact person\'s name is unknown, use "Hello!" or another natural English greeting that fits the context.',
  "- Do not put the greeting into a separate paragraph.",
  "- Do not use Russian phrases, Russian examples, or mixed-language wording.",
  "- If the vacancy role is unclear, omit the role name but keep the opening concise.",
  "- Avoid em dashes and dash-heavy phrasing; prefer short sentences, commas, or a colon.",
  "- Write in a simple, human, professional tone.",
  "- Avoid overly formal, bureaucratic, or corporate wording.",
  "- Avoid phrases that sound too polished, dramatic, or artificial.",
  '- Do not use obvious reasons such as "I like frontend", "I enjoy working on interfaces", or "this work is close to me".',
  "- Do not lead with a long explanation of why I applied.",
  "Keep interest in the vacancy short and tied to my relevant experience.",
  '- Avoid abstract phrases such as "interesting project", "promising company", "great team", "I want to grow", or "the work is close to me".',
  "Do not restate the profile.",
  "Use only facts from the candidate profile and vacancy.",
  "Prefer project, product, or domain names over employer names when describing experience, for example DEX Aggregator, partner portal, or SaaS platform.",
  "Mention employer or company names only if they are essential context, a meaningful advantage for this vacancy, or explicitly requested by the user.",
  "Do not invent experience, metrics, technologies, employers, or achievements.",
  "Mention 2-3 relevant facts from my experience.",
  "Do not turn the relevant experience paragraph into a long catalog of companies, tools, and responsibilities.",
  "Do not mention more than one primary project or company in the relevant experience paragraph unless the vacancy explicitly requires it.",
  "Do not add a third body paragraph that lists adjacent skills, familiar areas, tools, or processes.",
  'Do not use generic fallback phrases such as "In other projects..." or "I also worked with..."; fold only directly relevant adjacent experience into the primary project paragraph.',
  "Do not repeat technologies already mentioned in the opening unless the repeat is attached to a concrete project fact.",
  'Avoid generic usefulness sentences such as "I can be useful in architecture, technical decisions, code quality, and collaboration".',
  "Do not use generic phrases without specifics.",
  "Do not use bullet points inside the final letter.",
  "Keep the letter within 2-3 short paragraphs.",
  "Output only the letter text.",
  'End with: "I have attached my resume for a more detailed overview. I would be glad to discuss how I can be useful to your team. Thank you, and have a great day!"',
  "- Mention only the key technologies needed for the vacancy and back them up with facts.",
];

export const RUSSIAN_COVER_LETTER_RULES = [
  "Структура:",
  '1. Первый абзац начать с "Здравствуйте!" или "Добрый день!", добавить "Заинтересовала ваша вакансия: [название роли]" и в этом же абзаце кратко представить, кто я.',
  "2. Во втором абзаце рассказать об одном основном проекте или компании с 2-3 самыми сильными совпадениями под требования вакансии.",
  "3. Добавить максимум одно короткое предложение про смежный опыт, только если он прямо усиливает соответствие вакансии.",
  "4. Не добавлять отдельный общий абзац о пользе; если польза уместна, показать ее конкретно через уже описанный опыт.",
  "5. Закончить фиксированной финальной фразой отдельным финальным абзацем.",
  "Правила:",
  "- Если имя контактного лица известно, обратиться по имени.",
  '- Если имя контактного лица неизвестно, использовать "Здравствуйте!" или "Добрый день!".',
  "- Не выносить приветствие в отдельный абзац.",
  '- Если в русском письме нужно назвать меня, писать только имя кириллицей: "Меня зовут Никита". Не писать фамилию и не писать мое имя латиницей.',
  '- Если русское написание имени не получается естественно, не упоминать имя и начать представление с "Я Senior Fullstack Developer...".',
  '- Не использовать разговорные приветствия вроде "Привет" или "Приветствую".',
  '- Не начинать с "Откликаюсь на позицию...".',
  '- Если название роли понятно из вакансии, использовать формулировку "Заинтересовала ваша вакансия: [название роли]".',
  '- Если роль можно естественно согласовать, допустимо написать "Заинтересовала ваша вакансия на позицию [роль в родительном падеже]".',
  "- Если название роли неочевидно, не придумывать его и оставить вступление коротким.",
  "- Использовать тире и дефисы как можно реже; вместо них предпочитать короткие предложения, запятые или двоеточие.",
  "- Писать простым, живым и профессиональным тоном.",
  "- Избегать слишком формальных, бюрократических и корпоративных формулировок.",
  "- Избегать фраз, которые звучат слишком вылизанно, драматично или искусственно.",
  '- Не использовать очевидные причины вроде "мне нравится frontend", "люблю работать над интерфейсами" или "мне близка эта работа".',
  "- Не начинать основную часть письма с длинного объяснения, почему я откликнулся.",
  "- Держать интерес к вакансии коротким и связывать его с релевантным опытом.",
  '- Избегать абстрактных фраз вроде "интересный проект", "перспективная компания", "сильная команда", "хочу развиваться" или "мне близка эта работа".',
  '- Не писать отдельный общий абзац вида "Могу быть полезен..."; если конкретной пользы нечего добавить, сразу переходить к финальной фразе.',
  "- Не пересказывать профиль.",
  "- Использовать только факты из профиля кандидата и вакансии.",
  '- При описании опыта предпочитать название проекта, продукта или домена вместо названия компании, например "DEX Aggregator", "партнерский портал" или "SaaS-платформа".',
  "- Названия компаний упоминать только если они важны для контекста, дают существенное преимущество для вакансии или пользователь явно попросил.",
  "- Не придумывать опыт, метрики, технологии, работодателей или достижения.",
  "- Упомянуть 2-3 релевантных факта из моего опыта.",
  "- Не превращать абзац с релевантным опытом в длинный список компаний, инструментов и обязанностей.",
  "- Не упоминать больше одного основного проекта или компании в абзаце с релевантным опытом, если вакансия явно этого не требует.",
  "- Не добавлять третий содержательный абзац со списком смежных навыков, знакомых областей, инструментов или процессов.",
  '- Не использовать формулировки вроде "В других проектах..." или "Я также работал с..." как страховочный хвост.',
  "- Смежный опыт добавлять только если он прямо усиливает основной кейс, и встраивать его в абзац про основной проект без перечисления других проектов.",
  "- Не повторять технологии, уже названные во вступлении, если повтор не привязан к конкретному факту проекта.",
  '- Не использовать гибридные англо-русские глаголы; заменять их нормальными русскими формулировками вроде "перерабатывал архитектуру".',
  "- Не использовать общие фразы без конкретики.",
  "- Не использовать списки внутри итогового письма.",
  "- Держать письмо в пределах 2-3 коротких абзацев.",
  "- Вывести только текст письма.",
  '- Закончить фразой: "Прикрепляю резюме для подробного ознакомления. Буду рад обсудить, как могу быть полезен вашей команде. Спасибо вам и хорошего вам дня!"',
  "- Упоминать только ключевые для вакансии технологии и подкреплять их фактами.",
];

export const DEFAULT_COVER_LETTER_RULES = ENGLISH_COVER_LETTER_RULES;

export function getDefaultCoverLetterRules(language: string) {
  if (normalizeCoverLetterLanguage(language) === "Russian") {
    return RUSSIAN_COVER_LETTER_RULES;
  }

  return ENGLISH_COVER_LETTER_RULES;
}

export function normalizeCoverLetterLanguage(
  language: unknown,
): CoverLetterLanguage {
  const normalizedLanguage = readString(language).toLowerCase();

  if (["russian", "ru", "русский"].includes(normalizedLanguage)) {
    return "Russian";
  }

  if (["english", "en", "английский"].includes(normalizedLanguage)) {
    return "English";
  }

  return DEFAULT_COVER_LETTER_LANGUAGE;
}

function isLegacyUnsupportedCoverLetterLanguage(language: string) {
  const normalizedLanguage = writeLineValue(language).toLowerCase();

  return normalizedLanguage === "auto" || normalizedLanguage === "авто";
}

export type CoverLetterSettingsForm = {
  model: string;
  language: CoverLetterLanguage;
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
  const language = DEFAULT_COVER_LETTER_LANGUAGE;

  return {
    model: DEFAULT_OPENROUTER_MODEL,
    language,
    messageFormat: DEFAULT_MESSAGE_FORMAT,
    coverLetterRules: getDefaultCoverLetterRules(language),
  };
}

export function createDefaultCoverLetterSettingsJson(): CoverLetterSettingsJson {
  return coverLetterSettingsFormToJson(createDefaultCoverLetterSettingsForm());
}

export function coverLetterSettingsJsonToForm(
  settings: CoverLetterSettingsJson,
): CoverLetterSettingsForm {
  const language = normalizeCoverLetterLanguage(settings.language);

  return {
    model: normalizeOpenRouterModel(settings.model),
    language,
    messageFormat: settings.messageFormat,
    coverLetterRules: normalizeCoverLetterRules(
      settings.coverLetterRules,
      settings.language,
    ),
  };
}

export function coverLetterSettingsFormToJson(
  settings: CoverLetterSettingsForm,
): CoverLetterSettingsJson {
  const language = normalizeCoverLetterLanguage(settings.language);

  return {
    schemaVersion: 5,
    model: normalizeOpenRouterModel(settings.model),
    language,
    messageFormat: normalizeMessageFormat(settings.messageFormat),
    coverLetterRules: normalizeCoverLetterRules(
      settings.coverLetterRules,
      language,
    ),
  };
}

export function normalizeCoverLetterSettings(
  input: unknown,
): CoverLetterSettingsJson {
  if (!isRecord(input)) {
    return createDefaultCoverLetterSettingsJson();
  }

  const rawLanguage = readString(input.language);
  const language = normalizeCoverLetterLanguage(rawLanguage);

  return {
    schemaVersion: 5,
    model: normalizeOpenRouterModel(readString(input.model)),
    language,
    messageFormat: normalizeMessageFormat(input.messageFormat),
    coverLetterRules: normalizeCoverLetterRules(
      readStringList(input.coverLetterRules),
      rawLanguage || language,
    ),
  };
}

export function normalizeMessageFormat(
  input: unknown,
  fallback: MessageFormat = DEFAULT_MESSAGE_FORMAT,
): MessageFormat {
  return MESSAGE_FORMAT_VALUES.includes(input as MessageFormat)
    ? (input as MessageFormat)
    : fallback;
}

function normalizeCoverLetterRules(items: string[], language: string) {
  const normalizedItems = normalizeRuleLines(items);

  if (
    !normalizedItems.length ||
    isDefaultCoverLetterRules(normalizedItems) ||
    isLegacyUnsupportedCoverLetterLanguage(language)
  ) {
    return getDefaultCoverLetterRules(language);
  }

  return ensureRules(normalizedItems, [COVER_LETTER_TENSE_RULE]);
}

function isDefaultCoverLetterRules(items: string[]) {
  return [
    LEGACY_DEFAULT_COVER_LETTER_RULES,
    FLAT_DEFAULT_COVER_LETTER_RULES,
    MIXED_DEFAULT_COVER_LETTER_RULES,
    ENGLISH_COVER_LETTER_RULES,
    RUSSIAN_COVER_LETTER_RULES,
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
