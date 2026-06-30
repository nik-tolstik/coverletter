import { ProfilePage } from "@/_pages/profile";
import { getProfile } from "@/entities/profile/server";

export const dynamic = "force-dynamic";

export default async function ProfileRoute() {
  const profile = await getProfile();

  return <ProfilePage initialProfile={profile} />;
}
