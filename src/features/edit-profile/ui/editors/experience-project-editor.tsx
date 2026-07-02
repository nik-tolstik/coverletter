"use client";

import { ChevronDownIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import type { ExperienceProjectForm } from "@/entities/profile";
import {
  formatTagValue,
  parseTagValue,
} from "@/features/edit-profile/model/tag-values";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { FieldGroup } from "@/shared/ui/field";
import { Separator } from "@/shared/ui/separator";

import { CollapsibleContent } from "../collapsible-content";
import { TagInputField } from "../fields/tag-input-field";
import { TextAreaField } from "../fields/text-area-field";
import { TextInputField } from "../fields/text-input-field";

export function ExperienceProjectEditor({
  project,
  companyIndex,
  projectIndex,
  onChange,
  onRemove,
}: {
  project: ExperienceProjectForm;
  companyIndex: number;
  projectIndex: number;
  onChange: (project: ExperienceProjectForm) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `company-${companyIndex}-project-${projectIndex}-content`;
  const projectTitle = project.name || `Проект ${projectIndex + 1}`;
  const projectMeta = [project.role, project.stack].filter(Boolean).join(" · ");

  function updateProjectField(key: keyof ExperienceProjectForm, value: string) {
    onChange({
      ...project,
      [key]: value,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Separator />
      <div className="flex flex-col">
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
              <span className="truncate font-heading text-sm font-medium">
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
            size="icon-sm"
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
                id={`company-${companyIndex}-project-${projectIndex}-name`}
                label="Название проекта"
                placeholder="Личный кабинет"
                value={project.name}
                onChange={(value) => updateProjectField("name", value)}
              />
              <TextInputField
                id={`company-${companyIndex}-project-${projectIndex}-role`}
                label="Роль"
                placeholder="Frontend Engineer"
                value={project.role}
                onChange={(value) => updateProjectField("role", value)}
              />
              <TagInputField
                id={`company-${companyIndex}-project-${projectIndex}-stack`}
                label="Стек"
                placeholder="React, TypeScript, GraphQL"
                value={parseTagValue(project.stack)}
                onChange={(value) =>
                  updateProjectField("stack", formatTagValue(value))
                }
              />
            </FieldGroup>
            <TextAreaField
              id={`company-${companyIndex}-project-${projectIndex}-work`}
              label="Описание"
              placeholder="Опишите свободным текстом, что делали на проекте, за что отвечали и какие результаты важны."
              value={project.workDescription}
              onChange={(value) => updateProjectField("workDescription", value)}
            />
          </div>
        </CollapsibleContent>
      </div>
    </div>
  );
}
