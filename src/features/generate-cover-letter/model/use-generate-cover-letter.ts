"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  MAX_COVER_LETTER_HISTORY_ITEMS,
  type CoverLetterHistoryItem,
  type CoverLetterHistoryState,
} from "@/entities/cover-letter-history";
import { ApiError, requestJson } from "@/shared/api/http-client";
import { queryKeys } from "@/shared/api/query-keys";

import type { GenerateCoverLetterRequest } from "./schema";

export type GenerateCoverLetterResponse = {
  coverLetter: string;
  historyItem: CoverLetterHistoryItem | null;
  historySaved: boolean;
  model: string;
};

export function useGenerateCoverLetterMutation(userEmail: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateCoverLetter,
    onSuccess(data) {
      if (!data.historyItem) {
        return;
      }

      queryClient.setQueryData<CoverLetterHistoryState>(
        queryKeys.coverLetterHistory(userEmail),
        (currentHistory) => ({
          history: [
            data.historyItem as CoverLetterHistoryItem,
            ...(currentHistory?.history ?? []).filter(
              (item) => item.id !== data.historyItem?.id,
            ),
          ].slice(0, MAX_COVER_LETTER_HISTORY_ITEMS),
          source: currentHistory?.source ?? "redis",
          updatedAt: currentHistory?.updatedAt,
        }),
      );
    },
  });
}

async function generateCoverLetter(settings: GenerateCoverLetterRequest) {
  const data = await requestJson<Partial<GenerateCoverLetterResponse>>(
    "/api/cover-letter",
    {
      method: "POST",
      body: JSON.stringify(settings),
    },
  );

  if (!data.coverLetter) {
    throw new ApiError("Не удалось создать письмо.", 502);
  }

  return {
    coverLetter: data.coverLetter,
    historyItem: data.historyItem ?? null,
    historySaved: data.historySaved ?? false,
    model: data.model ?? settings.model,
  } satisfies GenerateCoverLetterResponse;
}
