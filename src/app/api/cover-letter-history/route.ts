import {
  clearCoverLetterHistory,
  getCoverLetterHistory,
} from "@/entities/cover-letter-history/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const history = await getCoverLetterHistory();

  return Response.json(history);
}

export async function DELETE() {
  try {
    const history = await clearCoverLetterHistory();

    return Response.json(history);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "История писем не очищена.";

    return Response.json({ error: message }, { status: 502 });
  }
}
