"use client";

import { XIcon } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import {
  normalizeTags,
  parseTagInput,
} from "@/features/edit-profile/model/tag-values";
import { Badge } from "@/shared/ui/badge";
import {
  AnimatedInlineItem,
  AnimatedItemsPresence,
  useAnimatedListKeys,
} from "@/shared/ui/animated-list";
import { Field, FieldLabel } from "@/shared/ui/field";

export type TagInputFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
};

export function TagInputField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: TagInputFieldProps) {
  const [draft, setDraft] = useState("");
  const tags = normalizeTags(value);
  const { keys, insertKeys, removeKey } = useAnimatedListKeys(tags.length, id);

  function commitTags(nextTags: string[]) {
    onChange(normalizeTags(nextTags));
  }

  function addDraftTag(text: string) {
    const nextTags = parseTagInput(text);

    if (!nextTags.length) {
      return;
    }

    const nextNormalizedTags = normalizeTags([...tags, ...nextTags]);

    insertKeys(nextNormalizedTags.length - tags.length);
    commitTags(nextNormalizedTags);
    setDraft("");
  }

  function removeTag(index: number) {
    removeKey(index);
    commitTags(tags.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === ";") {
      event.preventDefault();
      addDraftTag(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && tags.length) {
      event.preventDefault();
      removeTag(tags.length - 1);
    }
  }

  function handleInputChange(nextValue: string) {
    if (!/[,\n;]/.test(nextValue)) {
      setDraft(nextValue);
      return;
    }

    const parts = nextValue.split(/[,\n;]/);
    const completedTags = parseTagInput(parts.slice(0, -1).join(","));
    const nextDraft = parts.at(-1) ?? "";

    if (completedTags.length) {
      const nextNormalizedTags = normalizeTags([...tags, ...completedTags]);

      insertKeys(nextNormalizedTags.length - tags.length);
      commitTags(nextNormalizedTags);
    }

    setDraft(nextDraft);
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-4xl bg-input/30 px-2 py-1 transition-colors focus-within:bg-input/50">
        <AnimatedItemsPresence mode="popLayout">
          {tags.map((tag, index) => (
            <AnimatedInlineItem
              key={keys[index]}
              itemKey={keys[index]}
              className="inline-flex"
            >
              <Badge
                variant="secondary"
                className="h-6 gap-1 rounded-4xl px-2 text-sm"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Удалить ${tag}`}
                  className="rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  onClick={() => removeTag(index)}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            </AnimatedInlineItem>
          ))}
        </AnimatedItemsPresence>
        <input
          id={id}
          value={draft}
          placeholder={tags.length ? "" : placeholder}
          className="h-7 min-w-28 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addDraftTag(draft)}
        />
      </div>
    </Field>
  );
}
