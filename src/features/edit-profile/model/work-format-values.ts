export const workFormatOptions = [
  { value: "Remote", label: "Удалённо" },
  { value: "Hybrid", label: "Гибрид" },
  { value: "Office", label: "Офис" },
] as const;

export function parseWorkFormatValues(value: string): string[] {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  return workFormatOptions
    .filter((item) =>
      normalizedValue.toLowerCase().includes(item.value.toLowerCase()),
    )
    .map((item) => item.value);
}

export function formatWorkFormatValues(values: string[]): string {
  return values.join(", ");
}
