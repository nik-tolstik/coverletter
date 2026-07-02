import { generateCoverLetterRequestSchema } from "@/features/generate-cover-letter/model";
import { generateCoverLetter } from "@/features/generate-cover-letter/server";
import { addGeneratedCoverLetterToHistory } from "@/entities/cover-letter-history/server";
import type { MessageFormat } from "@/entities/cover-letter-settings";
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
    const historyResult = await saveGeneratedCoverLetterToHistory({
      ...payload.data,
      coverLetter,
    });

    return Response.json({
      coverLetter,
      historyItem: historyResult.item,
      historySaved: historyResult.saved,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось создать письмо.";

    return Response.json({ error: message }, { status: 502 });
  }
}

async function saveGeneratedCoverLetterToHistory({
  coverLetter,
  model,
  vacancyText,
  language,
  additionalWishes,
  messageFormat,
  coverLetterRules,
}: {
  coverLetter: string;
  model: string;
  vacancyText: string;
  language: string;
  additionalWishes?: string;
  messageFormat: MessageFormat;
  coverLetterRules: string[];
}) {
  try {
    const history = await addGeneratedCoverLetterToHistory({
      coverLetter,
      model,
      vacancyText,
      language,
      additionalWishes: additionalWishes ?? "",
      messageFormat,
      coverLetterRules,
    });

    return {
      item: history.item,
      saved: true,
    };
  } catch {
    return {
      item: null,
      saved: false,
    };
  }
}
