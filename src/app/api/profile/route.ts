import { saveProfile, getProfile } from "@/entities/profile/server";
import { profileWriteRequestSchema } from "@/features/edit-profile/server";
import { requireApiAuthenticatedUser } from "@/entities/auth/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireApiAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Требуется вход." }, { status: 401 });
  }

  const profile = await getProfile(user.email);

  return Response.json(profile);
}

export async function PUT(request: Request) {
  const user = await requireApiAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Требуется вход." }, { status: 401 });
  }

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
    const profile = await saveProfile(user.email, payload.data.profile);

    return Response.json(profile);
  } catch {
    return Response.json(
      { error: "Что-то пошло не так." },
      { status: 502 },
    );
  }
}
