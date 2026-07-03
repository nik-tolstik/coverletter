import { CoverLetterWorkspace } from "@/widgets/cover-letter-workspace";
import type { CoverLetterHistoryItem } from "@/entities/cover-letter-history";
import type { CoverLetterSettingsForm } from "@/entities/cover-letter-settings";
import { AppHeader } from "@/widgets/app-navigation";

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
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-190 flex-col gap-5 px-4 pt-5 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <AppHeader userEmail={userEmail} />
        <CoverLetterWorkspace
          initialHistory={initialHistory}
          initialSettings={initialSettings}
        />
      </div>
    </main>
  );
}
