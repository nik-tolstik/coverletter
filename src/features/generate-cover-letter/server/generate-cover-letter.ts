import "server-only";

import type { GenerateCoverLetterRequest } from "@/features/generate-cover-letter/model";
import { createChatCompletion } from "@/shared/api/openrouter";

type GenerateCoverLetterInput = GenerateCoverLetterRequest & {
  profileMarkdown: string;
};

export async function generateCoverLetter({
  profileMarkdown,
  vacancyText,
  language,
  additionalWishes,
  communicationStyle,
  coverLetterRules,
}: GenerateCoverLetterInput) {
  return createChatCompletion([
    {
      role: "system",
      content: buildSystemPrompt({
        profileMarkdown,
        communicationStyle,
        coverLetterRules,
      }),
    },
    {
      role: "user",
      content: buildUserPrompt({
        language,
        additionalWishes,
        vacancyText,
      }),
    },
  ]);
}

function buildSystemPrompt({
  profileMarkdown,
  communicationStyle,
  coverLetterRules,
}: {
  profileMarkdown: string;
  communicationStyle: string[];
  coverLetterRules: string[];
}) {
  return `You are an assistant that writes precise, honest cover letters.

Use the candidate profile below as the source of truth.
Do not invent facts, employers, metrics, achievements, or technologies.
If the vacancy asks for something absent from the profile, connect only adjacent real experience and do not claim direct expertise.
Write in the requested language.
Keep the letter concise, specific, and relevant to the vacancy.

Candidate profile:

${profileMarkdown}

Communication style:

${formatBullets(communicationStyle)}

Cover letter rules:

${formatBullets(coverLetterRules)}`;
}

function buildUserPrompt({
  language,
  additionalWishes,
  vacancyText,
}: {
  language: string;
  additionalWishes?: string;
  vacancyText: string;
}) {
  return `Target language: ${language}

Additional wishes:
${additionalWishes || "None"}

Vacancy:
${vacancyText}`;
}

function formatBullets(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}
