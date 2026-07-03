import { ProfilePage } from "@/_pages/profile";
import { getProfile } from "@/entities/profile/server";
import { requireAuthenticatedUser } from "@/entities/auth/server";

export const dynamic = "force-dynamic";

export default async function ProfileRoute() {
  const user = await requireAuthenticatedUser();
  const profile = await getProfile(user.email);

  return <ProfilePage userEmail={user.email} initialProfile={profile} />;
}
