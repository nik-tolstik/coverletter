"use client";

import { ChevronDownIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import type { StandaloneProjectForm } from "@/entities/profile";
import {
  formatTagValue,
  parseTagValue,
} from "@/features/edit-profile/model/tag-values";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { FieldGroup } from "@/shared/ui/field";

import { CollapsibleContent } from "../collapsible-content";
import { TagInputField } from "../fields/tag-input-field";
import { TextAreaField } from "../fields/text-area-field";
import { TextInputField } from "../fields/text-input-field";

export function StandaloneProjectEditor({
  project,
  index,
  onChange,
  onRemove,
}: {
  project: StandaloneProjectForm;
  index: number;
  onChange: (project: StandaloneProjectForm) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `standalone-project-${index}-content`;
  const projectTitle = project.name || `Проект ${index + 1}`;
  const projectMeta = [project.role, project.stack].filter(Boolean).join(" · ");

  function updateProjectField(key: keyof StandaloneProjectForm, value: string) {
    onChange({
      ...project,
      [key]: value,
    });
  }

  return (
    <section className="flex flex-col rounded-xl bg-input/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setIsOpen((current) => !current)}
        >
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
              !isOpen && "-rotate-90",
            )}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-heading text-base font-medium">
              {projectTitle}
            </span>
            {projectMeta && (
              <span className="truncate text-xs text-muted-foreground">
                {projectMeta}
              </span>
            )}
          </span>
        </button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          aria-label={`Удалить проект ${projectTitle}`}
        >
          <Trash2Icon />
        </Button>
      </div>

      <CollapsibleContent
        id={contentId}
        isOpen={isOpen}
        contentClassName="pt-5"
      >
        <div className="flex flex-col gap-5 pt-1">
          <FieldGroup className="grid gap-5">
            <TextInputField
              id={`standalone-project-${index}-name`}
              label="Название проекта"
              placeholder="Coverletter"
              value={project.name}
              onChange={(value) => updateProjectField("name", value)}
            />
            <TextInputField
              id={`standalone-project-${index}-role`}
              label="Роль"
              placeholder="Автор проекта"
              value={project.role}
              onChange={(value) => updateProjectField("role", value)}
            />
            <TagInputField
              id={`standalone-project-${index}-stack`}
              label="Стек"
              placeholder="Next.js, TypeScript, API"
              value={parseTagValue(project.stack)}
              onChange={(value) =>
                updateProjectField("stack", formatTagValue(value))
              }
            />
          </FieldGroup>
          <TextAreaField
            id={`standalone-project-${index}-work`}
            label="Описание"
            placeholder="Опишите свободным текстом, что сделали, какие решения принимали и почему проект важен."
            value={project.workDescription}
            onChange={(value) => updateProjectField("workDescription", value)}
          />
        </div>
      </CollapsibleContent>
    </section>
  );
}
