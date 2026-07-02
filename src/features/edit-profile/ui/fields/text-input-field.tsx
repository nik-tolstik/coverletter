"use client";

import type { ComponentProps } from "react";

import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type NativeInputProps = Omit<
  ComponentProps<typeof Input>,
  "id" | "value" | "onChange"
>;

export type TextInputFieldProps = NativeInputProps & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TextInputField({
  id,
  label,
  value,
  onChange,
  ...inputProps
}: TextInputFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </Field>
  );
}
