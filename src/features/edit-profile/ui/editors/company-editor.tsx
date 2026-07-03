"use client";

import { ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import type {
  ExperienceCompanyForm,
  ExperienceProjectForm,
} from "@/entities/profile";
import { cn } from "@/shared/lib/utils";
import {
  AnimatedList,
  AnimatedListItem,
  useAnimatedListKeys,
} from "@/shared/ui/animated-list";
import { Button } from "@/shared/ui/button";
import { FieldGroup } from "@/shared/ui/field";

import { CollapsibleContent } from "../collapsible-content";
import { CompanyDatesField } from "../fields/company-dates-field";
import { TextAreaField } from "../fields/text-area-field";
import { TextInputField } from "../fields/text-input-field";
import { ExperienceProjectEditor } from "./experience-project-editor";

export function CompanyEditor({
  company,
  index,
  onChange,
  onRemove,
  onProjectChange,
  onProjectAdd,
  onProjectRemove,
}: {
  company: ExperienceCompanyForm;
  index: number;
  onChange: (company: ExperienceCompanyForm) => void;
  onRemove: () => void;
  onProjectChange: (
    projectIndex: number,
    project: ExperienceProjectForm,
  ) => void;
  onProjectAdd: () => void;
  onProjectRemove: (projectIndex: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const contentId = `company-${index}-content`;
  const companyTitle = company.companyName || `Компания ${index + 1}`;
  const companyMeta = [company.role, company.dates].filter(Boolean).join(" · ");
  const { keys, insertKey, removeKey } = useAnimatedListKeys(
    company.projects.length,
    `company-${index}-project`,
  );

  function updateCompanyField(
    key: keyof Omit<ExperienceCompanyForm, "projects">,
    value: string,
  ) {
    onChange({
      ...company,
      [key]: value,
    });
  }

  function handleProjectAdd() {
    insertKey();
    onProjectAdd();
  }

  function handleProjectRemove(projectIndex: number) {
    removeKey(projectIndex);
    onProjectRemove(projectIndex);
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
              {companyTitle}
            </span>
            {companyMeta && (
              <span className="truncate text-xs text-muted-foreground">
                {companyMeta}
              </span>
            )}
          </span>
        </button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          aria-label={`Удалить компанию ${companyTitle}`}
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
              id={`company-${index}-name`}
              label="Компания"
              placeholder="Acme Corp"
              value={company.companyName}
              onChange={(value) => updateCompanyField("companyName", value)}
            />
            <TextInputField
              id={`company-${index}-role`}
              label="Роль"
              placeholder="Frontend Engineer"
              value={company.role}
              onChange={(value) => updateCompanyField("role", value)}
            />
            <CompanyDatesField
              id={`company-${index}-dates`}
              label="Даты"
              value={company.dates}
              onChange={(value) => updateCompanyField("dates", value)}
            />
            <TextInputField
              id={`company-${index}-domain`}
              label="Домен"
              placeholder="FinTech"
              value={company.domain}
              onChange={(value) => updateCompanyField("domain", value)}
            />
            <TextAreaField
              id={`company-${index}-description`}
              label="Описание"
              placeholder="Коротко опишите продукт, команду, задачи или контекст компании."
              value={company.description}
              onChange={(value) => updateCompanyField("description", value)}
            />
          </FieldGroup>

          <AnimatedList className="-mb-5 flex flex-col">
            {company.projects.map((project, projectIndex) => (
              <AnimatedListItem
                key={keys[projectIndex]}
                itemKey={keys[projectIndex]}
                spacing="1.25rem"
              >
                <ExperienceProjectEditor
                  project={project}
                  companyIndex={index}
                  projectIndex={projectIndex}
                  canRemove={company.projects.length > 1}
                  onChange={(nextProject) =>
                    onProjectChange(projectIndex, nextProject)
                  }
                  onRemove={() => handleProjectRemove(projectIndex)}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={handleProjectAdd}
          >
            <PlusIcon data-icon="inline-start" />
            Добавить проект
          </Button>
        </div>
      </CollapsibleContent>
    </section>
  );
}
