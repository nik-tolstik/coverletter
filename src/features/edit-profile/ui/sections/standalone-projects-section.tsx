"use client";

import { PlusIcon } from "lucide-react";

import type { StandaloneProjectForm } from "@/entities/profile";
import { Button } from "@/shared/ui/button";

import { StandaloneProjectEditor } from "../editors/standalone-project-editor";
import { ProfileSectionCard } from "../profile-section-card";

export function StandaloneProjectsSection({
  projects,
  onAdd,
  onChange,
  onRemove,
}: {
  projects: StandaloneProjectForm[];
  onAdd: () => void;
  onChange: (index: number, project: StandaloneProjectForm) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <ProfileSectionCard
      title="Отдельные проекты"
      contentId="profile-projects-content"
      contentClassName="flex flex-col gap-8"
    >
      {projects.map((project, projectIndex) => (
        <StandaloneProjectEditor
          key={projectIndex}
          project={project}
          index={projectIndex}
          onChange={(nextProject) => onChange(projectIndex, nextProject)}
          onRemove={() => onRemove(projectIndex)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={onAdd}
      >
        <PlusIcon data-icon="inline-start" />
        Добавить проект
      </Button>
    </ProfileSectionCard>
  );
}
