"use client";

import { CheckIcon } from "lucide-react";

import {
  formatWorkFormatValues,
  parseWorkFormatValues,
  workFormatOptions,
} from "@/features/edit-profile/model/work-format-values";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";

export type WorkFormatFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function WorkFormatField({ value, onChange }: WorkFormatFieldProps) {
  const selectedFormats = parseWorkFormatValues(value);

  function toggleFormat(format: string) {
    const nextFormats = selectedFormats.includes(format)
      ? selectedFormats.filter((item) => item !== format)
      : [...selectedFormats, format];

    onChange(formatWorkFormatValues(nextFormats));
  }

  return (
    <Field>
      <FieldLabel>Формат работы</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {workFormatOptions.map((item) => {
          const isSelected = selectedFormats.includes(item.value);

          return (
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="gap-0"
              onClick={() => toggleFormat(item.value)}
              aria-pressed={isSelected}
              key={item.value}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-4 shrink-0 items-center overflow-hidden transition-[width,opacity,margin-right] duration-100 ease-out",
                  isSelected ? "mr-1 w-4 opacity-100" : "mr-0 w-0 opacity-0",
                )}
              >
                <CheckIcon className="size-4" />
              </span>
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </Field>
  );
}
