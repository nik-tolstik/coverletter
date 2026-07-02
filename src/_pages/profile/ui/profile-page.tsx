import { ProfileEditorPage } from "@/features/edit-profile";
import type { ProfileState } from "@/entities/profile";

export function ProfilePage({
  initialProfile,
}: {
  initialProfile: ProfileState;
}) {
  return <ProfileEditorPage initialProfile={initialProfile.profile} />;
}
