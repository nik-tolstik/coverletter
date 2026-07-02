export function parseTagValue(value: string): string[] {
  return parseTagInput(value);
}

export function formatTagValue(value: string[]): string {
  return normalizeTags(value).join(", ");
}

export function parseTagInput(value: string): string[] {
  return normalizeTags(value.split(/\s*(?:,|;|\n)\s*/));
}

export function normalizeTags(value: string[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of value) {
    const tag = item.replace(/\s+/g, " ").trim();
    const normalizedTag = tag.toLowerCase();

    if (!tag || seen.has(normalizedTag)) {
      continue;
    }

    seen.add(normalizedTag);
    tags.push(tag);
  }

  return tags;
}
