"use client";

import { ChevronDownIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import type { EducationItemForm } from "@/entities/profile";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { FieldGroup } from "@/shared/ui/field";

import { CollapsibleContent } from "../collapsible-content";
import { CompanyDatesField } from "../fields/company-dates-field";
import { TextAreaField } from "../fields/text-area-field";
import { TextInputField } from "../fields/text-input-field";

export function EducationItemEditor({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: EducationItemForm;
  index: number;
  onChange: (item: EducationItemForm) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `education-${index}-content`;
  const itemTitle = item.institution || item.degree || `Обучение ${index + 1}`;
  const itemMeta = [item.degree, item.dates].filter(Boolean).join(" · ");

  function updateItemField(key: keyof EducationItemForm, value: string) {
    onChange({
      ...item,
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
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
              !isOpen && "-rotate-90",
            )}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-heading text-base font-medium">
              {itemTitle}
            </span>
            {itemMeta && (
              <span className="truncate text-xs text-muted-foreground">
                {itemMeta}
              </span>
            )}
          </span>
        </button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          aria-label={`Удалить образование ${itemTitle}`}
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
              id={`education-${index}-institution`}
              label="Учебное заведение"
              placeholder="БГУИР"
              value={item.institution}
              onChange={(value) => updateItemField("institution", value)}
            />
            <TextInputField
              id={`education-${index}-degree`}
              label="Степень или программа"
              placeholder="Frontend-разработка"
              value={item.degree}
              onChange={(value) => updateItemField("degree", value)}
            />
            <CompanyDatesField
              id={`education-${index}-dates`}
              label="Даты"
              value={item.dates}
              onChange={(value) => updateItemField("dates", value)}
            />
          </FieldGroup>
          <TextAreaField
            id={`education-${index}-description`}
            label="Описание"
            placeholder="Добавьте курсы, сертификаты, специализацию или важные учебные проекты."
            value={item.description}
            onChange={(value) => updateItemField("description", value)}
          />
        </div>
      </CollapsibleContent>
    </section>
  );
}
