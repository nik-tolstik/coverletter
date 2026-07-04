"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requestJson } from "@/shared/api/http-client";
import { queryKeys } from "@/shared/api/query-keys";

import type { CoverLetterHistoryState } from "./history";

type ClearHistoryContext = {
  previousHistory?: CoverLetterHistoryState;
};

export function useCoverLetterHistoryQuery({
  initialHistory,
  userEmail,
}: {
  initialHistory: CoverLetterHistoryState;
  userEmail: string;
}) {
  return useQuery({
    queryKey: queryKeys.coverLetterHistory(userEmail),
    queryFn: getCoverLetterHistory,
    initialData: initialHistory,
  });
}

export function useClearCoverLetterHistoryMutation(userEmail: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.coverLetterHistory(userEmail);

  return useMutation<
    CoverLetterHistoryState,
    Error,
    void,
    ClearHistoryContext
  >({
    mutationFn: clearCoverLetterHistory,
    async onMutate() {
      await queryClient.cancelQueries({ queryKey });

      const previousHistory =
        queryClient.getQueryData<CoverLetterHistoryState>(queryKey);

      queryClient.setQueryData<CoverLetterHistoryState>(queryKey, {
        history: [],
        source: previousHistory?.source ?? "redis",
        updatedAt: previousHistory?.updatedAt,
      });

      return { previousHistory };
    },
    onError(_error, _variables, context) {
      if (context?.previousHistory) {
        queryClient.setQueryData(queryKey, context.previousHistory);
      }
    },
    onSuccess(history) {
      queryClient.setQueryData(queryKey, history);
    },
  });
}

function getCoverLetterHistory() {
  return requestJson<CoverLetterHistoryState>("/api/cover-letter-history");
}

function clearCoverLetterHistory() {
  return requestJson<CoverLetterHistoryState>("/api/cover-letter-history", {
    method: "DELETE",
  });
}
