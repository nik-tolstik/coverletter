"use client";

import { useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import {
  createEmptyLanguageEntry,
  formatLanguagesValue,
  languageLevelOptions,
  parseLanguagesValue,
  type LanguageEntry,
} from "@/features/edit-profile/model/language-values";
import { removeAt } from "@/features/edit-profile/model/collection";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  AnimatedList,
  AnimatedListItem,
  useAnimatedListKeys,
} from "@/shared/ui/animated-list";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export type LanguagesFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LanguagesField({ value, onChange }: LanguagesFieldProps) {
  const [draftLanguageCount, setDraftLanguageCount] = useState(0);
  const parsedLanguages = parseLanguagesValue(value);
  const languages = [
    ...parsedLanguages,
    ...Array.from({ length: draftLanguageCount }, createEmptyLanguageEntry),
  ];
  const { keys, insertKey, removeKey } = useAnimatedListKeys(
    languages.length,
    "language",
  );

  function commit(nextLanguages: LanguageEntry[]) {
    setDraftLanguageCount(countEmptyLanguageEntries(nextLanguages));
    onChange(formatLanguagesValue(nextLanguages));
  }

  function updateLanguage(index: number, nextLanguage: string) {
    commit(
      languages.map((item, currentIndex) =>
        currentIndex === index ? { ...item, language: nextLanguage } : item,
      ),
    );
  }

  function updateLevel(index: number, nextLevel: string) {
    commit(
      languages.map((item, currentIndex) =>
        currentIndex === index ? { ...item, level: nextLevel } : item,
      ),
    );
  }

  function addLanguage() {
    insertKey();
    setDraftLanguageCount((currentCount) => currentCount + 1);
  }

  function removeLanguage(index: number) {
    removeKey(index);
    commit(removeAt(languages, index, createEmptyLanguageEntry()));
  }

  return (
    <Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FieldLabel>Языки</FieldLabel>
        <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
          <PlusIcon data-icon="inline-start" />
          Добавить
        </Button>
      </div>
      <AnimatedList className="flex flex-col gap-3">
        {languages.map((item, index) => (
          <AnimatedListItem
            key={keys[index]}
            itemKey={keys[index]}
            variant="accordion"
            className="grid items-center gap-3 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <Field>
              <Input
                id={`identity-language-${index}`}
                value={item.language}
                placeholder="Язык"
                aria-label={`Язык ${index + 1}`}
                onChange={(event) => updateLanguage(index, event.target.value)}
              />
            </Field>
            <Field>
              <Select
                value={item.level || undefined}
                onValueChange={(nextLevel) => updateLevel(index, nextLevel)}
              >
                <SelectTrigger
                  id={`identity-language-level-${index}`}
                  className="w-full"
                  aria-label={`Уровень языка ${index + 1}`}
                >
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {languageLevelOptions.map((option) => (
                      <SelectItem value={option.value} key={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={() => removeLanguage(index)}
              aria-label={`Удалить язык ${index + 1}`}
              disabled={languages.length === 1}
            >
              <Trash2Icon />
            </Button>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </Field>
  );
}

function countEmptyLanguageEntries(languages: LanguageEntry[]) {
  return languages.filter((item) => !item.language && !item.level).length;
}
