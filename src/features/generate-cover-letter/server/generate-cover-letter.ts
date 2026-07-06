import "server-only";

import type { GenerateCoverLetterRequest } from "@/features/generate-cover-letter/model";
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
  coverLetterRules,
}: GenerateCoverLetterInput) {
  const completion = await createChatCompletion(
    [
      {
        role: "system",
        content: buildSystemPrompt({
          profileMarkdown,
          language,
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

  return {
    coverLetter: completion.content,
    model: completion.model,
  };
}

function buildSystemPrompt({
  profileMarkdown,
  language,
  coverLetterRules,
}: {
  profileMarkdown: string;
  language: string;
  coverLetterRules: string[];
}) {
  return `You are an assistant that writes precise, honest job application messages.

Use the candidate profile below as the source of truth.
Do not invent facts, employers, metrics, achievements, or technologies.
If the vacancy asks for something absent from the profile, connect only adjacent real experience and do not claim direct expertise.
${getSystemLanguageInstructions(language)}
Keep the response concise, specific, and relevant to the vacancy.

Candidate profile:

${profileMarkdown}

Cover letter rules:

${formatLines(coverLetterRules)}

Output format:

${formatBullets(getOutputFormatRules())}`;
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
  return `${getUserLanguageInstructions(language)}

Additional wishes:
${additionalWishes || "None"}

Vacancy:
${vacancyText}

${getFinalLanguageInstructions(language)}`;
}

function formatBullets(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function formatLines(items: string[]) {
  return items.join("\n");
}

function getOutputFormatRules() {
  return [
    "Write as a normal direct chat message, not as a formal email or classical cover letter.",
    'Do not use "Dear ...", "Best regards", formal signatures, subject lines, headers, or formal closing blocks.',
    "Use a direct, natural, human tone with short paragraphs.",
  ];
}

function getSystemLanguageInstructions(language: string) {
  return [
    `Write the final answer entirely in ${language}.`,
    "The target language has higher priority than the language of the vacancy, candidate profile, cover letter rules, or additional wishes.",
  ].join("\n");
}

function getUserLanguageInstructions(language: string) {
  return `Target language: ${language}`;
}

function getFinalLanguageInstructions(language: string) {
  return [
    `Final output language: ${language}`,
    `Write every sentence of the final answer in ${language}.`,
  ].join("\n");
}
