"use client";

import { PlusIcon } from "lucide-react";

import type { StandaloneProjectForm } from "@/entities/profile";
import {
  AnimatedList,
  AnimatedListItem,
  useAnimatedListKeys,
} from "@/shared/ui/animated-list";
import { Button } from "@/shared/ui/button";

import { EmptySectionState } from "../empty-section-state";
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
  const { keys, insertKey, removeKey } = useAnimatedListKeys(
    projects.length,
    "standalone-project",
  );

  function handleAdd() {
    insertKey();
    onAdd();
  }

  function handleRemove(index: number) {
    removeKey(index);
    onRemove(index);
  }

  return (
    <ProfileSectionCard
      title="Отдельные проекты"
      contentId="profile-projects-content"
      contentClassName="flex flex-col gap-4"
    >
      <AnimatedList className="flex flex-col">
        {projects.map((project, projectIndex, array) => (
          <AnimatedListItem
            key={keys[projectIndex]}
            itemKey={keys[projectIndex]}
            spacing={projectIndex < array.length - 1 ? "1rem" : 0}
          >
            <StandaloneProjectEditor
              project={project}
              index={projectIndex}
              onChange={(nextProject) => onChange(projectIndex, nextProject)}
              onRemove={() => handleRemove(projectIndex)}
            />
          </AnimatedListItem>
        ))}
        {!projects.length && (
          <AnimatedListItem
            key="empty-projects"
            itemKey="empty-projects"
            spacing="1rem"
          >
            <EmptySectionState />
          </AnimatedListItem>
        )}
      </AnimatedList>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAdd}
      >
        <PlusIcon data-icon="inline-start" />
        Добавить проект
      </Button>
    </ProfileSectionCard>
  );
}
