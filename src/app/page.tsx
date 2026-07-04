import { HomePage } from "@/_pages/home";
import { getCoverLetterHistory } from "@/entities/cover-letter-history/server";
import { getCoverLetterSettings } from "@/entities/cover-letter-settings/server";
import { requireAuthenticatedUser } from "@/entities/auth/server";
import { getProfile } from "@/entities/profile/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireAuthenticatedUser();
  const [settings, history, profile] = await Promise.all([
    getCoverLetterSettings(user.email),
    getCoverLetterHistory(user.email),
    getProfile(user.email),
  ]);

  return (
    <HomePage
      initialProfileAvatarUrl={profile.profile.identity.avatarUrl}
      userEmail={user.email}
      initialSettings={settings.settings}
      initialHistory={history.history}
    />
  );
}
