import { CoverLetterWorkspace } from "@/widgets/cover-letter-workspace";
import type { CoverLetterHistoryItem } from "@/entities/cover-letter-history";
import type { CoverLetterSettingsForm } from "@/entities/cover-letter-settings";

export function HomePage({
  initialHistory,
  initialSettings,
}: {
  initialHistory: CoverLetterHistoryItem[];
  initialSettings: CoverLetterSettingsForm;
}) {
  return (
    <CoverLetterWorkspace
      initialHistory={initialHistory}
      initialSettings={initialSettings}
    />
  );
}
