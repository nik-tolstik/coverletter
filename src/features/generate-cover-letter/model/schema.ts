import {
  DEFAULT_COVER_LETTER_RULES,
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
  useEmailFormat: boolean;
  coverLetterRules: string[];
};

export const generateCoverLetterRequestSchema = {
  safeParse(input: unknown): ParseResult<GenerateCoverLetterRequest> {
    if (!isRecord(input)) {
      return { success: false, error: "Ожидался объект." };
    }

    const vacancyText = readRequiredString(input.vacancyText);
    const language = readRequiredString(input.language);

    if (!vacancyText || !language) {
      return { success: false, error: "Заполните обязательные поля." };
    }

    return {
      success: true,
      data: {
        model: normalizeOpenRouterModel(readOptionalString(input.model)),
        vacancyText,
        language,
        additionalWishes: readOptionalString(input.additionalWishes),
        useEmailFormat: readBoolean(input.useEmailFormat, true),
        coverLetterRules: readStringList(
          input.coverLetterRules,
          DEFAULT_COVER_LETTER_RULES,
        ),
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

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readStringList(value: unknown, fallback: string[]) {
  const rules = Array.isArray(value)
    ? value.map(readOptionalString).filter(Boolean)
    : typeof value === "string"
      ? value
          .split("\n")
          .map(readOptionalString)
          .filter(Boolean)
      : [];

  return rules.length ? rules : fallback;
}
