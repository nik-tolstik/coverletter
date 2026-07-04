"use client";

import { CheckIcon } from "lucide-react";

import { employmentTypeOptions } from "@/features/edit-profile/model/employment-type-values";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";

export type EmploymentTypeFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function EmploymentTypeField({
  value,
  onChange,
}: EmploymentTypeFieldProps) {
  function selectEmploymentType(nextValue: string) {
    onChange(value === nextValue ? "" : nextValue);
  }

  return (
    <Field>
      <FieldLabel>Тип занятости</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {employmentTypeOptions.map((item) => {
          const isSelected = value === item.value;

          return (
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="gap-0"
              onClick={() => selectEmploymentType(item.value)}
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

