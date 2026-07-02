"use client";

import { CheckIcon } from "lucide-react";

import {
  formatWorkFormatValues,
  parseWorkFormatValues,
  workFormatOptions,
} from "@/features/edit-profile/model/work-format-values";
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
              onClick={() => toggleFormat(item.value)}
              aria-pressed={isSelected}
              key={item.value}
            >
              {isSelected && (
                <CheckIcon data-icon="inline-start" aria-hidden="true" />
              )}
              {item.label}
            </Button>
          );
        })}
      </div>
    </Field>
  );
}
