import { HomePage } from "@/_pages/home";
import { getCoverLetterHistory } from "@/entities/cover-letter-history/server";
import { getCoverLetterSettings } from "@/entities/cover-letter-settings/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, history] = await Promise.all([
    getCoverLetterSettings(),
    getCoverLetterHistory(),
  ]);

  return (
    <HomePage
      initialSettings={settings.settings}
      initialHistory={history.history}
    />
  );
}
