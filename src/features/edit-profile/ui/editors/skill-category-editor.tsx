"use client";

import { ChevronDownIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import type { SkillCategoryForm } from "@/entities/profile";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { FieldGroup } from "@/shared/ui/field";

import { CollapsibleContent } from "../collapsible-content";
import { TagInputField } from "../fields/tag-input-field";
import { TextInputField } from "../fields/text-input-field";

export function SkillCategoryEditor({
  category,
  index,
  onChange,
  onRemove,
}: {
  category: SkillCategoryForm;
  index: number;
  onChange: (category: SkillCategoryForm) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const contentId = `skill-category-${index}-content`;
  const categoryTitle = category.name || `Категория ${index + 1}`;
  const categoryMeta = category.skills.length
    ? `${category.skills.length} навыков`
    : "";

  function updateCategoryName(name: string) {
    onChange({
      ...category,
      name,
    });
  }

  function updateSkills(skills: string[]) {
    onChange({
      ...category,
      skills,
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
              {categoryTitle}
            </span>
            {categoryMeta && (
              <span className="truncate text-xs text-muted-foreground">
                {categoryMeta}
              </span>
            )}
          </span>
        </button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          aria-label={`Удалить категорию ${categoryTitle}`}
        >
          <Trash2Icon />
        </Button>
      </div>
      <CollapsibleContent
        id={contentId}
        isOpen={isOpen}
        contentClassName="pt-5"
      >
        <div className="pt-1">
          <FieldGroup className="grid gap-5">
            <TextInputField
              id={`skill-category-${index}-name`}
              label="Название категории"
              placeholder="Frontend"
              value={category.name}
              onChange={updateCategoryName}
            />
            <TagInputField
              id={`skill-category-${index}-skills`}
              label="Навыки"
              placeholder="React"
              value={category.skills}
              onChange={updateSkills}
            />
          </FieldGroup>
        </div>
      </CollapsibleContent>
    </section>
  );
}
