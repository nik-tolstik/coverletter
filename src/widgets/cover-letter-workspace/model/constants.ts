import type { MessageFormat } from "@/entities/cover-letter-settings";

export const MESSAGE_FORMAT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "message", label: "Сообщение" },
] satisfies Array<{ value: MessageFormat; label: string }>;

export const OPENROUTER_MODEL_GROUPS = [
  { tier: "pro", label: "Pro" },
  { tier: "balanced", label: "Balanced" },
  { tier: "free", label: "Free" },
] as const;

export const SETTINGS_SAVE_DEBOUNCE_MS = 800;
