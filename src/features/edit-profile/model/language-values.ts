export type LanguageEntry = {
  language: string;
  level: string;
};

export const languageLevelOptions = [
  { value: "Native", label: "Native", aliases: ["родной"] },
  { value: "Fluent", label: "Fluent", aliases: ["C2"] },
  { value: "Advanced", label: "Advanced", aliases: ["C1"] },
  {
    value: "Upper-Intermediate",
    label: "Upper-Intermediate",
    aliases: ["B2"],
  },
  { value: "Intermediate", label: "Intermediate", aliases: ["B1"] },
  { value: "Pre-Intermediate", label: "Pre-Intermediate", aliases: ["A2"] },
  { value: "Beginner", label: "Beginner", aliases: ["A1"] },
] as const;

export function createEmptyLanguageEntry(): LanguageEntry {
  return { language: "", level: "" };
}

export function parseLanguagesValue(value: string): LanguageEntry[] {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [createEmptyLanguageEntry()];
  }

  const entries = normalizedValue
    .split(/\s*(?:,|;|\n)\s*/)
    .map(parseLanguageEntry)
    .filter((item) => item.language || item.level);

  return entries.length ? entries : [createEmptyLanguageEntry()];
}

export function formatLanguagesValue(languages: LanguageEntry[]): string {
  return languages
    .filter((item) => item.language || item.level)
    .map((item) => formatLanguageValue(item.language, item.level))
    .join(", ");
}

function parseLanguageEntry(value: string): LanguageEntry {
  const normalizedValue = value.replace(/\s+/g, " ").trim();

  if (!normalizedValue) {
    return createEmptyLanguageEntry();
  }

  const separatedParts = splitLanguageEntry(normalizedValue);

  if (separatedParts) {
    const [left, right] = separatedParts;
    const leftLevel = readLanguageLevel(left);
    const rightLevel = readLanguageLevel(right);

    if (leftLevel && right && !rightLevel) {
      return { language: right, level: leftLevel };
    }

    return { language: left, level: rightLevel ?? right };
  }

  const levelAtEnd = readBoundaryLanguageLevel(normalizedValue, "end");

  if (levelAtEnd) {
    return {
      language: normalizedValue.slice(0, -levelAtEnd.raw.length).trim(),
      level: levelAtEnd.value,
    };
  }

  const levelAtStart = readBoundaryLanguageLevel(normalizedValue, "start");

  if (levelAtStart) {
    return {
      language: normalizedValue.slice(levelAtStart.raw.length).trim(),
      level: levelAtStart.value,
    };
  }

  return { language: normalizedValue, level: "" };
}

function formatLanguageValue(language: string, level: string): string {
  if (language && level) {
    return `${language} - ${level}`;
  }

  return language || level;
}

function readLanguageLevel(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  const option = languageLevelOptions.find(
    (item) =>
      item.value.toLowerCase() === normalizedValue ||
      item.label.toLowerCase() === normalizedValue ||
      item.aliases.some((alias) => alias.toLowerCase() === normalizedValue),
  );

  return option?.value;
}

function splitLanguageEntry(value: string): [string, string] | undefined {
  const spacedSeparator = value.match(/^(.+?)\s+[-–—:]\s+(.+)$/);

  if (spacedSeparator?.[1] && spacedSeparator[2]) {
    return [spacedSeparator[1].trim(), spacedSeparator[2].trim()];
  }

  const compactSeparator = value.match(/^(.+?)\s*[:–—]\s*(.+)$/);

  if (compactSeparator?.[1] && compactSeparator[2]) {
    return [compactSeparator[1].trim(), compactSeparator[2].trim()];
  }

  const compactHyphenLevel = value.match(
    new RegExp(`^(.+)-(${getLanguageLevelPattern()})$`, "i"),
  );

  if (compactHyphenLevel?.[1] && compactHyphenLevel[2]) {
    return [compactHyphenLevel[1].trim(), compactHyphenLevel[2].trim()];
  }

  return undefined;
}

function readBoundaryLanguageLevel(
  value: string,
  boundary: "start" | "end",
): { raw: string; value: string } | undefined {
  for (const option of languageLevelOptions) {
    const escapedLevels = [option.value, option.label, ...option.aliases]
      .map(escapeRegExp)
      .join("|");
    const pattern =
      boundary === "start"
        ? new RegExp(`^(?:${escapedLevels})(?=\\s|$)`, "i")
        : new RegExp(`(?:^|\\s)(${escapedLevels})$`, "i");
    const match = value.match(pattern);

    const raw = boundary === "start" ? match?.[0] : match?.[1];

    if (raw) {
      return {
        raw,
        value: option.value,
      };
    }
  }

  return undefined;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getLanguageLevelPattern() {
  return languageLevelOptions
    .flatMap((option) => [option.value, option.label, ...option.aliases])
    .map(escapeRegExp)
    .join("|");
}
