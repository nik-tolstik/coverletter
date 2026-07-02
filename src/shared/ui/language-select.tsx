"use client";

import { GB, RU } from "country-flag-icons/react/3x2";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

export const LANGUAGE_OPTIONS = [
  {
    value: "Russian",
    label: "Русский",
    icon: RU,
  },
  {
    value: "English",
    label: "Английский",
    icon: GB,
  },
] as const;

export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

export function LanguageSelect({
  id,
  value,
  onValueChange,
  placeholder = "Язык",
  ariaLabel,
  className,
}: {
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const selectedLanguage = getLanguageOption(value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        id={id}
        className={cn("w-full", className)}
        aria-label={ariaLabel}
      >
        <SelectValue placeholder={placeholder}>
          {selectedLanguage && (
            <LanguageSelectLabel option={selectedLanguage} />
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {LANGUAGE_OPTIONS.map((option) => (
            <SelectItem
              value={option.value}
              key={option.value}
              textValue={option.label}
            >
              <LanguageSelectLabel option={option} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function getLanguageLabel(language: string) {
  return getLanguageOption(language)?.label ?? language;
}

export function getLanguageOption(language?: string) {
  return LANGUAGE_OPTIONS.find((item) => item.value === language);
}

export function LanguageSelectLabel({ option }: { option: LanguageOption }) {
  const Icon = option.icon;

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full"
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 truncate">{option.label}</span>
    </span>
  );
}
