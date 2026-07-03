import { ProfileEditorPage } from "@/features/edit-profile";
import type { ProfileState } from "@/entities/profile";

export function ProfilePage({
  initialProfile,
  userEmail,
}: {
  initialProfile: ProfileState;
  userEmail: string;
}) {
  return (
    <ProfileEditorPage
      userEmail={userEmail}
      initialProfile={initialProfile.profile}
    />
  );
}
