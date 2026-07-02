"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createEmptyCompany,
  createEmptyExperienceProject,
  createEmptySkillCategory,
  createEmptyStandaloneProject,
  serializeProfileFormToMarkdown,
  type ExperienceCompanyForm,
  type ExperienceProjectForm,
  type ProfileFormState,
  type SkillCategoryForm,
  type StandaloneProjectForm,
} from "@/entities/profile";

import { removeAt, serializeProfile } from "./collection";

export type IdentityKey = keyof ProfileFormState["identity"];
export type LinkKey = keyof ProfileFormState["links"];

type ProfileSaveResponse = {
  error?: string;
  profile?: ProfileFormState;
};

export function useProfileEditor(initialProfile: ProfileFormState) {
  const [profile, setProfile] = useState(() => initialProfile);
  const [savedProfile, setSavedProfile] = useState(() => initialProfile);
  const [saveError, setSaveError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const latestProfileRef = useRef(profile);
  const profileSnapshot = serializeProfile(profile);
  const savedProfileSnapshot = serializeProfile(savedProfile);
  const isDirty = profileSnapshot !== savedProfileSnapshot;

  useEffect(() => {
    latestProfileRef.current = profile;
  }, [profile]);

  function saveProfile() {
    if (!isDirty || isPending) {
      return;
    }

    const profileToSave = profile;
    const saveSnapshot = serializeProfile(profileToSave);

    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile: profileToSave,
          }),
        });
        const data = await readProfileSaveResponse(response);

        if (!response.ok) {
          const message = data.error ?? "Профиль не сохранён.";

          setSaveError(message);
          toast.error(message);
          return;
        }

        const nextSavedProfile = data.profile ?? profileToSave;
        const hasNewUnsavedChanges =
          serializeProfile(latestProfileRef.current) !== saveSnapshot;

        setSavedProfile(nextSavedProfile);
        setProfile((currentProfile) =>
          serializeProfile(currentProfile) === saveSnapshot
            ? nextSavedProfile
            : currentProfile,
        );
        setSaveError(undefined);
        toast.success(
          hasNewUnsavedChanges
            ? "Профиль сохранён. Есть новые несохранённые изменения."
            : "Профиль сохранён.",
        );
      } catch {
        const message =
          "Профиль не сохранён. Проверьте подключение к хранилищу.";

        setSaveError(message);
        toast.error(message);
      }
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
      skills: removeAt(current.skills, index, createEmptySkillCategory()),
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
      experience: removeAt(current.experience, index, createEmptyCompany()),
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
      projects: removeAt(current.projects, index, createEmptyStandaloneProject()),
    }));
  }

  return {
    profile,
    isDirty,
    isPending,
    saveError,
    saveProfile,
    cancelChanges,
    exportProfileMarkdown,
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
    updateStandaloneProject,
    addStandaloneProject,
    removeStandaloneProject,
  };
}

async function readProfileSaveResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {};
  }

  try {
    return (await response.json()) as ProfileSaveResponse;
  } catch {
    return {};
  }
}
