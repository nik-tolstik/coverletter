import type { CoverLetterHistoryItem } from "@/entities/cover-letter-history";
import type { CoverLetterSettingsForm } from "@/entities/cover-letter-settings";

export type LetterGenerationSettings = CoverLetterSettingsForm & {
  vacancyText: string;
  additionalWishes: string;
};

export type SavedLetterSettings = CoverLetterSettingsForm;

export type HistoryItemAction = (item: CoverLetterHistoryItem) => void;
