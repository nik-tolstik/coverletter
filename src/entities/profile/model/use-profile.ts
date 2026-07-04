"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requestForm, requestJson } from "@/shared/api/http-client";
import { queryKeys } from "@/shared/api/query-keys";

import type { ProfileFormState } from "./structured-profile";
import type { ProfileState } from "./types";

type UploadAvatarInput = {
  file: File;
  profile: ProfileFormState;
};

export function useProfileQuery({
  initialProfile,
  userEmail,
}: {
  initialProfile: ProfileState;
  userEmail: string;
}) {
  return useQuery({
    queryKey: queryKeys.profile(userEmail),
    queryFn: getProfile,
    initialData: initialProfile,
  });
}

export function useSaveProfileMutation(userEmail: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveProfile,
    onSuccess(profile) {
      queryClient.setQueryData(queryKeys.profile(userEmail), profile);
    },
  });
}

export function useUploadAvatarMutation(userEmail: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess(profile) {
      queryClient.setQueryData(queryKeys.profile(userEmail), profile);
    },
  });
}

function getProfile() {
  return requestJson<ProfileState>("/api/profile");
}

function saveProfile(profile: ProfileFormState) {
  return requestJson<ProfileState>("/api/profile", {
    method: "PUT",
    body: JSON.stringify({ profile }),
  });
}

function uploadAvatar({ file, profile }: UploadAvatarInput) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("profile", JSON.stringify(profile));

  return requestForm<ProfileState>("/api/profile/avatar", formData, {
    method: "PUT",
  });
}
