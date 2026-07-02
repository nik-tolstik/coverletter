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
    const generationStartedAt = Date.now();
    const generation = await generateCoverLetter({
      ...payload.data,
      profileMarkdown: profile.markdown,
    });
    const generationDurationMs = Date.now() - generationStartedAt;
    const historyResult = await saveGeneratedCoverLetterToHistory({
      ...payload.data,
      coverLetter: generation.coverLetter,
      generationDurationMs,
      model: generation.model,
    });

    return Response.json({
      coverLetter: generation.coverLetter,
      historyItem: historyResult.item,
      historySaved: historyResult.saved,
      model: generation.model,
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
  generationDurationMs,
  model,
  vacancyText,
  language,
  additionalWishes,
  messageFormat,
  coverLetterRules,
}: {
  coverLetter: string;
  generationDurationMs: number;
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
      generationDurationMs,
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
