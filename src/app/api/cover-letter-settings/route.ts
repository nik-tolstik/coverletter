import {
  getCoverLetterSettings,
  saveCoverLetterSettings,
} from "@/entities/cover-letter-settings/server";
import {
  coverLetterSettingsJsonToForm,
  normalizeCoverLetterSettings,
} from "@/entities/cover-letter-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getCoverLetterSettings();

  return Response.json(settings);
}

export async function PUT(request: Request) {
  const payload = await request.json();

  if (!isRecord(payload) || !isRecord(payload.settings)) {
    return Response.json(
      { error: "Настройки письма не могут быть пустыми." },
      { status: 400 },
    );
  }

  try {
    const settings = await saveCoverLetterSettings(
      coverLetterSettingsJsonToForm(
        normalizeCoverLetterSettings(payload.settings),
      ),
    );

    return Response.json(settings);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Настройки письма не сохранены.";

    return Response.json({ error: message }, { status: 502 });
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
