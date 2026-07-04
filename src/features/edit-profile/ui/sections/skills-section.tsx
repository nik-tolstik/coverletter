"use client";

import { PlusIcon, WrenchIcon } from "lucide-react";

import type { SkillCategoryForm } from "@/entities/profile";
import {
  AnimatedList,
  AnimatedListItem,
  useAnimatedListKeys,
} from "@/shared/ui/animated-list";
import { Button } from "@/shared/ui/button";

import { EmptySectionState } from "../empty-section-state";
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
  const { keys, insertKey, removeKey } = useAnimatedListKeys(
    skills.length,
    "skill-category",
  );

  function handleAdd() {
    insertKey();
    onAdd();
  }

  function handleRemove(index: number) {
    removeKey(index);
    onRemove(index);
  }

  return (
    <ProfileSectionCard
      title="Навыки"
      icon={WrenchIcon}
      contentId="profile-skills-content"
      contentClassName="flex flex-col gap-5"
    >
      <AnimatedList className="flex flex-col">
        {skills.map((category, categoryIndex, array) => (
          <AnimatedListItem
            key={keys[categoryIndex]}
            itemKey={keys[categoryIndex]}
            spacing={categoryIndex < array.length - 1 ? "1rem" : 0}
          >
            <SkillCategoryEditor
              category={category}
              index={categoryIndex}
              onChange={(nextCategory) => onChange(categoryIndex, nextCategory)}
              onRemove={() => handleRemove(categoryIndex)}
            />
          </AnimatedListItem>
        ))}
        {!skills.length && (
          <AnimatedListItem key="empty-skills" itemKey="empty-skills">
            <EmptySectionState />
          </AnimatedListItem>
        )}
      </AnimatedList>
      <Button
        type="button"
        variant="outline"
        className="self-end"
        onClick={handleAdd}
      >
        <PlusIcon data-icon="inline-start" />
        Добавить категорию
      </Button>
    </ProfileSectionCard>
  );
}
