import {
  clearCoverLetterHistory,
  getCoverLetterHistory,
} from "@/entities/cover-letter-history/server";
import { requireApiAuthenticatedUser } from "@/entities/auth/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireApiAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Требуется вход." }, { status: 401 });
  }

  const history = await getCoverLetterHistory(user.email);

  return Response.json(history);
}

export async function DELETE() {
  const user = await requireApiAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Требуется вход." }, { status: 401 });
  }

  try {
    const history = await clearCoverLetterHistory(user.email);

    return Response.json(history);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "История писем не очищена.";

    return Response.json({ error: message }, { status: 502 });
  }
}
