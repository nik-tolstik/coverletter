import { generateCoverLetterRequestSchema } from "@/features/generate-cover-letter/model";
import { generateCoverLetter } from "@/features/generate-cover-letter/server";
import { getProfile } from "@/entities/profile/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = generateCoverLetterRequestSchema.safeParse(await request.json());

  if (!payload.success) {
    return Response.json(
      { error: "Укажите текст вакансии и язык письма." },
      { status: 400 },
    );
  }

  try {
    const profile = await getProfile();
    const coverLetter = await generateCoverLetter({
      ...payload.data,
      profileMarkdown: profile.markdown,
    });

    return Response.json({ coverLetter });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось создать письмо.";

    return Response.json({ error: message }, { status: 502 });
  }
}
