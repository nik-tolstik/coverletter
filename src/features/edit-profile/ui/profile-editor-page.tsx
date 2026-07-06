"use client";

import { ChevronDownIcon, DownloadIcon, LogOutIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { signOut } from "next-auth/react";

import type { ProfileState } from "@/entities/profile";
import { useProfileEditor } from "@/features/edit-profile/model/use-profile-editor";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { SaveChangesBar } from "./save-changes-bar";
import { EducationSection } from "./sections/education-section";
import { ExperienceSection } from "./sections/experience-section";
import { IdentitySection } from "./sections/identity-section";
import { LinksSection } from "./sections/links-section";
import { SkillsSection } from "./sections/skills-section";
import { StandaloneProjectsSection } from "./sections/standalone-projects-section";

export function ProfileEditorPage({
  initialProfile,
  userEmail,
}: {
  initialProfile: ProfileState;
  userEmail: string;
}) {
  const editor = useProfileEditor(userEmail, initialProfile);

  return (
    <>
      <div className="flex flex-col gap-6" aria-busy={editor.isPending}>
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-xl font-semibold">Профиль</h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  <DownloadIcon data-icon="inline-start" />
                  Экспорт
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={editor.exportProfileMarkdown}>
                  Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void signOut({ redirectTo: "/auth" });
              }}
            >
              <LogOutIcon data-icon="inline-start" />
              Выйти
            </Button>
          </div>
        </header>

        <IdentitySection
          identity={editor.profile.identity}
          isAvatarUploading={editor.isAvatarUploading}
          avatarPreviewUrl={editor.avatarPreviewUrl}
          avatarImageVersion={editor.avatarImageVersion}
          onUpdate={editor.updateIdentity}
          onAvatarUpload={editor.uploadAvatar}
          onAvatarPreviewReady={editor.clearAvatarPreview}
        />

        <LinksSection
          links={editor.profile.links}
          onUpdate={editor.updateLink}
        />

        <SkillsSection
          skills={editor.profile.skills}
          onAdd={editor.addSkillCategory}
          onChange={editor.updateSkillCategory}
          onRemove={editor.removeSkillCategory}
        />

        <ExperienceSection
          experience={editor.profile.experience}
          onAdd={editor.addCompany}
          onChange={editor.updateCompany}
          onRemove={editor.removeCompany}
          onProjectChange={editor.updateExperienceProject}
          onProjectAdd={editor.addExperienceProject}
          onProjectRemove={editor.removeExperienceProject}
        />

        <EducationSection
          education={editor.profile.education}
          onAdd={editor.addEducationItem}
          onChange={editor.updateEducationItem}
          onRemove={editor.removeEducationItem}
        />

        <StandaloneProjectsSection
          projects={editor.profile.projects}
          onAdd={editor.addStandaloneProject}
          onChange={editor.updateStandaloneProject}
          onRemove={editor.removeStandaloneProject}
        />
      </div>

      <AnimatePresence initial={false}>
        {editor.isDirty && (
          <SaveChangesBar
            key="save-changes-bar"
            isPending={editor.isPending}
            onCancel={editor.cancelChanges}
            onSave={editor.saveProfile}
          />
        )}
      </AnimatePresence>
    </>
  );
}
