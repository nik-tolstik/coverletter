import { HomePage } from "@/_pages/home";
import { getCoverLetterSettings } from "@/entities/cover-letter-settings/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getCoverLetterSettings();

  return <HomePage initialSettings={settings.settings} />;
}
