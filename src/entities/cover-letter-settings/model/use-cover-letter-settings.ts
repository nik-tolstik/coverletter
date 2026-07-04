"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requestJson } from "@/shared/api/http-client";
import { queryKeys } from "@/shared/api/query-keys";

import type {
  CoverLetterSettingsForm,
  CoverLetterSettingsState,
} from "./settings";

export function useCoverLetterSettingsQuery({
  initialSettings,
  userEmail,
}: {
  initialSettings: CoverLetterSettingsState;
  userEmail: string;
}) {
  return useQuery({
    queryKey: queryKeys.coverLetterSettings(userEmail),
    queryFn: getCoverLetterSettings,
    initialData: initialSettings,
  });
}

export function useSaveCoverLetterSettingsMutation(userEmail: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveCoverLetterSettings,
    onSuccess(settings) {
      queryClient.setQueryData(
        queryKeys.coverLetterSettings(userEmail),
        settings,
      );
    },
  });
}

function getCoverLetterSettings() {
  return requestJson<CoverLetterSettingsState>("/api/cover-letter-settings");
}

function saveCoverLetterSettings(settings: CoverLetterSettingsForm) {
  return requestJson<CoverLetterSettingsState>("/api/cover-letter-settings", {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
}
