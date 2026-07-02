"use client";

import type { ComponentProps } from "react";
import type { IconType } from "react-icons";

import { cn } from "@/shared/lib/utils";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type NativeInputProps = Omit<
  ComponentProps<typeof Input>,
  "id" | "value" | "onChange"
>;

export type LinkInputFieldProps = NativeInputProps & {
  id: string;
  label: string;
  icon: IconType;
  iconClassName?: string;
  value: string;
  onChange: (value: string) => void;
};

export function LinkInputField({
  id,
  label,
  icon: Icon,
  iconClassName,
  value,
  onChange,
  ...inputProps
}: LinkInputFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        <Icon
          aria-hidden="true"
          className={cn("size-4 shrink-0", iconClassName)}
        />
        {label}
      </FieldLabel>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </Field>
  );
}
