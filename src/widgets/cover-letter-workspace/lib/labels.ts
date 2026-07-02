import {
  OPENROUTER_MODEL_OPTIONS,
  type MessageFormat,
} from "@/entities/cover-letter-settings";

export function getMessageFormatLabel(messageFormat: MessageFormat) {
  return messageFormat === "email" ? "Email" : "Сообщение";
}

export function getModelLabel(model: string) {
  return (
    OPENROUTER_MODEL_OPTIONS.find((item) => item.value === model)?.label ??
    model
  );
}

export function formatHistoryDate(value: string) {
  const [date, time] = value.split("T");

  if (!date || !time) {
    return value;
  }

  return `${date} ${time.slice(0, 5)} UTC`;
}
