"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  createEmptyCompany,
  createEmptyEducationItem,
  createEmptyExperienceProject,
  createEmptySkillCategory,
  createEmptyStandaloneProject,
  serializeProfileFormToMarkdown,
  type ExperienceCompanyForm,
  type ExperienceProjectForm,
  type ProfileFormState,
  type SkillCategoryForm,
  type StandaloneProjectForm,
  useProfileQuery,
  useSaveProfileMutation,
  useUploadAvatarMutation,
} from "@/entities/profile";
import type { ProfileState } from "@/entities/profile";
import type { EducationItemForm } from "@/entities/profile";

import { removeAt, removeAtOrEmpty, serializeProfile } from "./collection";

export type IdentityKey = keyof ProfileFormState["identity"];
export type LinkKey = keyof ProfileFormState["links"];

const fallbackMutationError = "Что-то пошло не так.";

export function useProfileEditor(
  userEmail: string,
  initialProfileState: ProfileState,
) {
  const profileQuery = useProfileQuery({
    initialProfile: initialProfileState,
    userEmail,
  });
  const initialProfile =
    profileQuery.data?.profile ?? initialProfileState.profile;
  const [profile, setProfile] = useState(() => initialProfile);
  const [savedProfile, setSavedProfile] = useState(() => initialProfile);
  const [saveError, setSaveError] = useState<string>();
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarImageVersion, setAvatarImageVersion] = useState(0);
  const latestProfileRef = useRef(profile);
  const profileSnapshot = serializeProfile(profile);
  const savedProfileSnapshot = serializeProfile(savedProfile);
  const isDirty = profileSnapshot !== savedProfileSnapshot;
  const saveProfileMutation = useSaveProfileMutation(userEmail);
  const uploadAvatarMutation = useUploadAvatarMutation(userEmail);

  function hasUnsavedChangesAfterSnapshot(snapshot: string) {
    return serializeProfile(latestProfileRef.current) !== snapshot;
  }

  function applySavedProfile(
    nextProfileState: ProfileState,
    snapshot: string,
    options: {
      syncAvatarIntoDraft: boolean;
    },
  ) {
    const nextSavedProfile = nextProfileState.profile;

    setSavedProfile(nextSavedProfile);
    setProfile((currentProfile) => {
      if (serializeProfile(currentProfile) === snapshot) {
        return nextSavedProfile;
      }

      if (!options.syncAvatarIntoDraft) {
        return currentProfile;
      }

      return {
        ...currentProfile,
        identity: {
          ...currentProfile.identity,
          avatarUrl: nextSavedProfile.identity.avatarUrl,
        },
      };
    });
    setSaveError(undefined);
  }

  useEffect(() => {
    latestProfileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    if (!avatarPreviewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  function saveProfile() {
    if (!isDirty || saveProfileMutation.isPending) {
      return;
    }

    const profileToSave = profile;
    const saveSnapshot = serializeProfile(profileToSave);

    saveProfileMutation.mutate(profileToSave, {
      onSuccess: (nextProfileState) => {
        applySavedProfile(nextProfileState, saveSnapshot, {
          syncAvatarIntoDraft: false,
        });
        toast.success(
          hasUnsavedChangesAfterSnapshot(saveSnapshot)
            ? "Профиль сохранён. Есть новые несохранённые изменения."
            : "Профиль сохранён.",
        );
      },
      onError: (error) => {
        const message = getMutationErrorMessage(error);

        setSaveError(message);
        toast.error(message);
      },
    });
  }

  function cancelChanges() {
    setProfile(savedProfile);
    setSaveError(undefined);
  }

  function exportProfileMarkdown() {
    try {
      const markdown = serializeProfileFormToMarkdown(profile);
      const blob = new Blob([markdown], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "coverletter-profile.md";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Markdown профиля экспортирован.");
    } catch {
      toast.error("Не удалось экспортировать профиль.");
    }
  }

  function uploadAvatar(file: File) {
    if (uploadAvatarMutation.isPending) {
      return;
    }

    const profileToSave = latestProfileRef.current;
    const uploadSnapshot = serializeProfile(profileToSave);
    const nextAvatarPreviewUrl = URL.createObjectURL(file);

    setAvatarPreviewUrl(nextAvatarPreviewUrl);
    uploadAvatarMutation.mutate(
      {
        file,
        profile: profileToSave,
      },
      {
        onSuccess: (nextProfileState) => {
          applySavedProfile(nextProfileState, uploadSnapshot, {
            syncAvatarIntoDraft: true,
          });
          setAvatarImageVersion((currentVersion) => currentVersion + 1);
          toast.success(
            hasUnsavedChangesAfterSnapshot(uploadSnapshot)
              ? "Аватар загружен. Есть новые несохранённые изменения."
              : "Аватар загружен.",
          );
        },
        onError: (error) => {
          const message = getMutationErrorMessage(error);

          setAvatarPreviewUrl("");
          setSaveError(message);
          toast.error(message);
        },
      },
    );
  }

  function clearAvatarPreview() {
    setAvatarPreviewUrl("");
  }

  function updateIdentity(key: IdentityKey, value: string) {
    setProfile((current) => ({
      ...current,
      identity: {
        ...current.identity,
        [key]: value,
      },
    }));
  }

  function updateLink(key: LinkKey, value: string) {
    setProfile((current) => ({
      ...current,
      links: {
        ...current.links,
        [key]: value,
      },
    }));
  }

  function updateSkillCategory(index: number, nextCategory: SkillCategoryForm) {
    setProfile((current) => ({
      ...current,
      skills: current.skills.map((category, categoryIndex) =>
        categoryIndex === index ? nextCategory : category,
      ),
    }));
  }

  function addSkillCategory() {
    setProfile((current) => ({
      ...current,
      skills: [...current.skills, createEmptySkillCategory()],
    }));
  }

  function removeSkillCategory(index: number) {
    setProfile((current) => ({
      ...current,
      skills: removeAtOrEmpty(current.skills, index),
    }));
  }

  function updateCompany(index: number, nextCompany: ExperienceCompanyForm) {
    setProfile((current) => ({
      ...current,
      experience: current.experience.map((company, companyIndex) =>
        companyIndex === index ? nextCompany : company,
      ),
    }));
  }

  function addCompany() {
    setProfile((current) => ({
      ...current,
      experience: [...current.experience, createEmptyCompany()],
    }));
  }

  function removeCompany(index: number) {
    setProfile((current) => ({
      ...current,
      experience: removeAtOrEmpty(current.experience, index),
    }));
  }

  function updateExperienceProject(
    companyIndex: number,
    projectIndex: number,
    nextProject: ExperienceProjectForm,
  ) {
    setProfile((current) => ({
      ...current,
      experience: current.experience.map((company, currentCompanyIndex) =>
        currentCompanyIndex === companyIndex
          ? {
              ...company,
              projects: company.projects.map((project, currentProjectIndex) =>
                currentProjectIndex === projectIndex ? nextProject : project,
              ),
            }
          : company,
      ),
    }));
  }

  function addExperienceProject(companyIndex: number) {
    setProfile((current) => ({
      ...current,
      experience: current.experience.map((company, currentCompanyIndex) =>
        currentCompanyIndex === companyIndex
          ? {
              ...company,
              projects: [...company.projects, createEmptyExperienceProject()],
            }
          : company,
      ),
    }));
  }

  function removeExperienceProject(companyIndex: number, projectIndex: number) {
    setProfile((current) => ({
      ...current,
      experience: current.experience.map((company, currentCompanyIndex) =>
        currentCompanyIndex === companyIndex
          ? {
              ...company,
              projects: removeAt(
                company.projects,
                projectIndex,
                createEmptyExperienceProject(),
              ),
            }
          : company,
      ),
    }));
  }

  function updateEducationItem(index: number, nextItem: EducationItemForm) {
    setProfile((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? nextItem : item,
      ),
    }));
  }

  function addEducationItem() {
    setProfile((current) => ({
      ...current,
      education: [...current.education, createEmptyEducationItem()],
    }));
  }

  function removeEducationItem(index: number) {
    setProfile((current) => ({
      ...current,
      education: removeAtOrEmpty(current.education, index),
    }));
  }

  function updateStandaloneProject(
    index: number,
    nextProject: StandaloneProjectForm,
  ) {
    setProfile((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) =>
        projectIndex === index ? nextProject : project,
      ),
    }));
  }

  function addStandaloneProject() {
    setProfile((current) => ({
      ...current,
      projects: [...current.projects, createEmptyStandaloneProject()],
    }));
  }

  function removeStandaloneProject(index: number) {
    setProfile((current) => ({
      ...current,
      projects: removeAtOrEmpty(current.projects, index),
    }));
  }

  return {
    profile,
    isDirty,
    isPending: saveProfileMutation.isPending,
    isAvatarUploading: uploadAvatarMutation.isPending,
    avatarPreviewUrl,
    avatarImageVersion,
    saveError,
    saveProfile,
    cancelChanges,
    exportProfileMarkdown,
    uploadAvatar,
    clearAvatarPreview,
    updateIdentity,
    updateLink,
    updateSkillCategory,
    addSkillCategory,
    removeSkillCategory,
    updateCompany,
    addCompany,
    removeCompany,
    updateExperienceProject,
    addExperienceProject,
    removeExperienceProject,
    updateEducationItem,
    addEducationItem,
    removeEducationItem,
    updateStandaloneProject,
    addStandaloneProject,
    removeStandaloneProject,
  };
}

function getMutationErrorMessage(error: Error) {
  return error.message || fallbackMutationError;
}
