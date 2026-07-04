import { CoverLetterWorkspace } from "@/widgets/cover-letter-workspace";
import type { CoverLetterHistoryState } from "@/entities/cover-letter-history";
import type { CoverLetterSettingsState } from "@/entities/cover-letter-settings";
import type { ProfileState } from "@/entities/profile";
import { AppHeader } from "@/widgets/app-navigation";

export function HomePage({
  initialHistory,
  initialProfile,
  initialSettings,
  userEmail,
}: {
  initialHistory: CoverLetterHistoryState;
  initialProfile: ProfileState;
  initialSettings: CoverLetterSettingsState;
  userEmail: string;
}) {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-190 flex-col gap-5 px-4 pt-5 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <AppHeader
          initialProfile={initialProfile}
          userEmail={userEmail}
        />
        <CoverLetterWorkspace
          initialHistory={initialHistory}
          initialSettings={initialSettings}
          userEmail={userEmail}
        />
      </div>
    </main>
  );
}
