import { saveProfile, getProfile } from "@/entities/profile/server";
import { profileWriteRequestSchema } from "@/features/edit-profile/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();

  return Response.json(profile);
}

export async function PUT(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return Response.json(
      { error: "Некорректный JSON в теле запроса." },
      { status: 400 },
    );
  }

  const payload = profileWriteRequestSchema.safeParse(requestBody);

  if (!payload.success) {
    return Response.json(
      { error: payload.error },
      { status: 400 },
    );
  }

  try {
    const profile = await saveProfile(payload.data.profile);

    return Response.json(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Профиль не сохранён.";

    return Response.json({ error: message }, { status: 502 });
  }
}
