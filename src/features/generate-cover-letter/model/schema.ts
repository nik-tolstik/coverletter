import {
  DEFAULT_MESSAGE_FORMAT,
  getDefaultCoverLetterRules,
  type MessageFormat,
  normalizeCoverLetterLanguage,
  normalizeOpenRouterModel,
} from "@/entities/cover-letter-settings";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type GenerateCoverLetterRequest = {
  model: string;
  vacancyText: string;
  language: string;
  additionalWishes?: string;
  messageFormat: MessageFormat;
  coverLetterRules: string[];
};

export const generateCoverLetterRequestSchema = {
  safeParse(input: unknown): ParseResult<GenerateCoverLetterRequest> {
    if (!isRecord(input)) {
      return { success: false, error: "Ожидался объект." };
    }

    const vacancyText = readRequiredString(input.vacancyText);
    const language = normalizeCoverLetterLanguage(input.language);

    if (!vacancyText) {
      return { success: false, error: "Заполните обязательные поля." };
    }

    return {
      success: true,
      data: {
        model: normalizeOpenRouterModel(readOptionalString(input.model)),
        vacancyText,
        language,
        additionalWishes: readOptionalString(input.additionalWishes),
        messageFormat: DEFAULT_MESSAGE_FORMAT,
        coverLetterRules: getDefaultCoverLetterRules(language),
      },
    };
  },
};

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}

function readRequiredString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : "";
}

function readOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
