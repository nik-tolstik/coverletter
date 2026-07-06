import { OPENROUTER_MODEL_OPTIONS } from "@/entities/cover-letter-settings";

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
