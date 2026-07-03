"use client";

import { ChevronDownIcon, DownloadIcon } from "lucide-react";

import type { ProfileFormState } from "@/entities/profile";
import { useProfileEditor } from "@/features/edit-profile/model/use-profile-editor";
import { Button } from "@/shared/ui/button";
import { UserMenu } from "@/widgets/app-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { SaveChangesBar } from "./save-changes-bar";
import { ExperienceSection } from "./sections/experience-section";
import { IdentitySection } from "./sections/identity-section";
import { LinksSection } from "./sections/links-section";
import { SkillsSection } from "./sections/skills-section";
import { StandaloneProjectsSection } from "./sections/standalone-projects-section";

export function ProfileEditorPage({
  initialProfile,
  userEmail,
}: {
  initialProfile: ProfileFormState;
  userEmail: string;
}) {
  const editor = useProfileEditor(initialProfile);

  return (
    <main className="min-h-dvh bg-background" aria-busy={editor.isPending}>
      <div className="mx-auto flex w-full max-w-190 flex-col gap-6 px-4 pt-5 pb-20">
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
            <UserMenu email={userEmail} />
          </div>
        </header>

        <IdentitySection
          identity={editor.profile.identity}
          onUpdate={editor.updateIdentity}
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

        <StandaloneProjectsSection
          projects={editor.profile.projects}
          onAdd={editor.addStandaloneProject}
          onChange={editor.updateStandaloneProject}
          onRemove={editor.removeStandaloneProject}
        />
      </div>

      {editor.isDirty && (
        <SaveChangesBar
          isPending={editor.isPending}
          onCancel={editor.cancelChanges}
          onSave={editor.saveProfile}
        />
      )}
    </main>
  );
}
