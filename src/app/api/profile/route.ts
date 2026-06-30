import { saveProfile, getProfile } from "@/entities/profile/server";
import type { ProfileFormState } from "@/entities/profile";
import { profileWriteRequestSchema } from "@/features/edit-profile/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();

  return Response.json(profile);
}

export async function PUT(request: Request) {
  const payload = profileWriteRequestSchema.safeParse(await request.json());

  if (!payload.success) {
    return Response.json(
      { error: "Профиль не может быть пустым." },
      { status: 400 },
    );
  }

  try {
    const profile = await saveProfile(payload.data.profile as ProfileFormState);

    return Response.json(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Профиль не сохранён.";

    return Response.json({ error: message }, { status: 502 });
  }
}
