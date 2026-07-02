export {
  COVER_LETTER_HISTORY_REDIS_KEY,
  MAX_COVER_LETTER_HISTORY_ITEMS,
  addCoverLetterHistoryItem,
  createCoverLetterHistoryItem,
  createDefaultCoverLetterHistoryJson,
  normalizeCoverLetterHistory,
} from "./model/history";
export type {
  CoverLetterHistoryItem,
  CoverLetterHistoryJson,
  CoverLetterHistoryState,
  CreateCoverLetterHistoryItemInput,
} from "./model/history";
