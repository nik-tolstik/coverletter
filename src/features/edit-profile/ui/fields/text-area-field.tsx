"use client";

import type { ComponentProps } from "react";

import { Field, FieldLabel } from "@/shared/ui/field";
import { Textarea } from "@/shared/ui/textarea";

type NativeTextareaProps = Omit<
  ComponentProps<typeof Textarea>,
  "id" | "value" | "onChange"
>;

export type TextAreaFieldProps = NativeTextareaProps & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...textareaProps}
      />
    </Field>
  );
}
