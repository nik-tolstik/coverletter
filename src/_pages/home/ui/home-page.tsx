import { CoverLetterWorkspace } from "@/widgets/cover-letter-workspace";
import type { CoverLetterSettingsForm } from "@/entities/cover-letter-settings";

export function HomePage({
  initialSettings,
}: {
  initialSettings: CoverLetterSettingsForm;
}) {
  return <CoverLetterWorkspace initialSettings={initialSettings} />;
}
