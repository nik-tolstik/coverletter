"use client";

import { PlusIcon } from "lucide-react";

import type { SkillCategoryForm } from "@/entities/profile";
import { Button } from "@/shared/ui/button";

import { SkillCategoryEditor } from "../editors/skill-category-editor";
import { ProfileSectionCard } from "../profile-section-card";

export function SkillsSection({
  skills,
  onAdd,
  onChange,
  onRemove,
}: {
  skills: SkillCategoryForm[];
  onAdd: () => void;
  onChange: (index: number, category: SkillCategoryForm) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <ProfileSectionCard
      title="Навыки"
      contentId="profile-skills-content"
      action={
        <Button type="button" variant="outline" onClick={onAdd}>
          <PlusIcon data-icon="inline-start" />
          Добавить категорию
        </Button>
      }
      contentClassName="flex flex-col gap-5"
    >
      {skills.map((category, categoryIndex) => (
        <SkillCategoryEditor
          key={categoryIndex}
          category={category}
          index={categoryIndex}
          onChange={(nextCategory) => onChange(categoryIndex, nextCategory)}
          onRemove={() => onRemove(categoryIndex)}
        />
      ))}
    </ProfileSectionCard>
  );
}
