"use client";

import { GraduationCapIcon, PlusIcon } from "lucide-react";

import type { EducationItemForm } from "@/entities/profile";
import {
  AnimatedList,
  AnimatedListItem,
  useAnimatedListKeys,
} from "@/shared/ui/animated-list";
import { Button } from "@/shared/ui/button";

import { EmptySectionState } from "../empty-section-state";
import { EducationItemEditor } from "../editors/education-item-editor";
import { ProfileSectionCard } from "../profile-section-card";

export function EducationSection({
  education,
  onAdd,
  onChange,
  onRemove,
}: {
  education: EducationItemForm[];
  onAdd: () => void;
  onChange: (index: number, item: EducationItemForm) => void;
  onRemove: (index: number) => void;
}) {
  const { keys, insertKey, removeKey } = useAnimatedListKeys(
    education.length,
    "education",
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
      title="Образование"
      icon={GraduationCapIcon}
      contentId="profile-education-content"
      contentClassName="flex flex-col gap-4"
    >
      <AnimatedList className="flex flex-col">
        {education.map((item, itemIndex, array) => (
          <AnimatedListItem
            key={keys[itemIndex]}
            itemKey={keys[itemIndex]}
            spacing={itemIndex < array.length - 1 ? "1rem" : 0}
          >
            <EducationItemEditor
              item={item}
              index={itemIndex}
              onChange={(nextItem) => onChange(itemIndex, nextItem)}
              onRemove={() => handleRemove(itemIndex)}
            />
          </AnimatedListItem>
        ))}
        {!education.length && (
          <AnimatedListItem key="empty-education" itemKey="empty-education">
            <EmptySectionState />
          </AnimatedListItem>
        )}
      </AnimatedList>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAdd}
      >
        <PlusIcon data-icon="inline-start" />
        Добавить обучение
      </Button>
    </ProfileSectionCard>
  );
}
