import { CoverLetterWorkspace } from "@/widgets/cover-letter-workspace";
import type { CoverLetterHistoryItem } from "@/entities/cover-letter-history";
import type { CoverLetterSettingsForm } from "@/entities/cover-letter-settings";

export function HomePage({
  initialHistory,
  initialSettings,
  userEmail,
}: {
  initialHistory: CoverLetterHistoryItem[];
  initialSettings: CoverLetterSettingsForm;
  userEmail: string;
}) {
  return (
    <CoverLetterWorkspace
      userEmail={userEmail}
      initialHistory={initialHistory}
      initialSettings={initialSettings}
    />
  );
}
