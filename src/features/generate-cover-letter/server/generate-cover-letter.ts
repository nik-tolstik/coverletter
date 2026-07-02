import "server-only";

import type { GenerateCoverLetterRequest } from "@/features/generate-cover-letter/model";
import type { MessageFormat } from "@/entities/cover-letter-settings";
import { createChatCompletion } from "@/shared/api/openrouter";

type GenerateCoverLetterInput = GenerateCoverLetterRequest & {
  profileMarkdown: string;
};

export async function generateCoverLetter({
  model,
  profileMarkdown,
  vacancyText,
  language,
  additionalWishes,
  messageFormat,
  coverLetterRules,
}: GenerateCoverLetterInput) {
  return createChatCompletion(
    [
      {
        role: "system",
        content: buildSystemPrompt({
          profileMarkdown,
          language,
          messageFormat,
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
    ],
    { model },
  );
}

function buildSystemPrompt({
  profileMarkdown,
  language,
  messageFormat,
  coverLetterRules,
}: {
  profileMarkdown: string;
  language: string;
  messageFormat: MessageFormat;
  coverLetterRules: string[];
}) {
  return `You are an assistant that writes precise, honest job application messages.

Use the candidate profile below as the source of truth.
Do not invent facts, employers, metrics, achievements, or technologies.
If the vacancy asks for something absent from the profile, connect only adjacent real experience and do not claim direct expertise.
Write the final answer entirely in ${language}.
The target language has higher priority than the language of the vacancy, candidate profile, cover letter rules, or additional wishes.
Keep the response concise, specific, and relevant to the vacancy.

Candidate profile:

${profileMarkdown}

Cover letter rules:

${formatLines(coverLetterRules)}

Output format:

${formatBullets(getOutputFormatRules(messageFormat))}`;
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
${vacancyText}

Final output language: ${language}
Write every sentence of the final answer in ${language}.`;
}

function formatBullets(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function formatLines(items: string[]) {
  return items.join("\n");
}

function getOutputFormatRules(messageFormat: MessageFormat) {
  if (messageFormat === "email") {
    return [
      "Write in a concise email cover letter format.",
      "A natural greeting and short closing are allowed when they fit the vacancy context.",
      "Do not add a subject line, metadata, or explanations outside the message.",
    ];
  }

  return [
    "Write as a normal direct chat message, not as a formal email or classical cover letter.",
    'Do not use "Dear ...", "Best regards", formal signatures, subject lines, headers, or formal closing blocks.',
    "Use a direct, natural, human tone with short paragraphs.",
  ];
}
