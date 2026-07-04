import {
  getCoverLetterSettings,
  saveCoverLetterSettings,
} from "@/entities/cover-letter-settings/server";
import { requireApiAuthenticatedUser } from "@/entities/auth/server";
import {
  coverLetterSettingsJsonToForm,
  normalizeCoverLetterSettings,
} from "@/entities/cover-letter-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireApiAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Требуется вход." }, { status: 401 });
  }

  const settings = await getCoverLetterSettings(user.email);

  return Response.json(settings);
}

export async function PUT(request: Request) {
  const user = await requireApiAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Требуется вход." }, { status: 401 });
  }

  const payload = await request.json();

  if (!isRecord(payload) || !isRecord(payload.settings)) {
    return Response.json(
      { error: "Настройки письма не могут быть пустыми." },
      { status: 400 },
    );
  }

  try {
    const settings = await saveCoverLetterSettings(
      user.email,
      coverLetterSettingsJsonToForm(
        normalizeCoverLetterSettings(payload.settings),
      ),
    );

    return Response.json(settings);
  } catch {
    return Response.json(
      { error: "Что-то пошло не так." },
      { status: 502 },
    );
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
