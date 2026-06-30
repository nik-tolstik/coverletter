import {
  DEFAULT_COMMUNICATION_STYLE,
  DEFAULT_COVER_LETTER_RULES,
} from "@/entities/cover-letter-settings";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type GenerateCoverLetterRequest = {
  vacancyText: string;
  language: string;
  additionalWishes?: string;
  communicationStyle: string[];
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
        vacancyText,
        language,
        additionalWishes: readOptionalString(input.additionalWishes),
        communicationStyle: readStringList(
          input.communicationStyle,
          DEFAULT_COMMUNICATION_STYLE,
        ),
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

function readStringList(value: unknown, fallback: string[]) {
  const rules = Array.isArray(value)
    ? value.map(readOptionalString).filter(Boolean)
    : typeof value === "string"
      ? value
          .split("\n")
          .map(readOptionalString)
          .filter(Boolean)
      : [];

  return rules.length ? deduplicateList(rules) : fallback;
}

function deduplicateList(items: string[]) {
  return Array.from(new Set(items));
}
