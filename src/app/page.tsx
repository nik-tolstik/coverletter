import { HomePage } from "@/_pages/home";
import { getCoverLetterHistory } from "@/entities/cover-letter-history/server";
import { getCoverLetterSettings } from "@/entities/cover-letter-settings/server";
import { requireAuthenticatedUser } from "@/entities/auth/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireAuthenticatedUser();
  const [settings, history] = await Promise.all([
    getCoverLetterSettings(user.email),
    getCoverLetterHistory(user.email),
  ]);

  return (
    <HomePage
      initialHistory={history}
      initialSettings={settings}
      userEmail={user.email}
    />
  );
}
