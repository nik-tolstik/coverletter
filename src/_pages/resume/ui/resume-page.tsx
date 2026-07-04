import type { ProfileState } from "@/entities/profile";
import { AppBottomNavigation, AppHeader } from "@/widgets/app-navigation";

export function ResumePage({
  initialProfile,
  userEmail,
}: {
  initialProfile: ProfileState;
  userEmail: string;
}) {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-190 flex-col gap-5 px-4 pt-5 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <AppHeader />
      </div>
      <AppBottomNavigation
        initialProfile={initialProfile}
        userEmail={userEmail}
      />
    </main>
  );
}
