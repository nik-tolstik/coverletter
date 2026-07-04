import { ProfileEditorPage } from "@/features/edit-profile";
import type { ProfileState } from "@/entities/profile";
import { AppHeader } from "@/widgets/app-navigation";

export function ProfilePage({
  initialProfile,
  userEmail,
}: {
  initialProfile: ProfileState;
  userEmail: string;
}) {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-190 flex-col gap-5 px-4 pt-5 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <AppHeader
          initialProfile={initialProfile}
          userEmail={userEmail}
        />
        <ProfileEditorPage
          initialProfile={initialProfile}
          userEmail={userEmail}
        />
      </div>
    </main>
  );
}
