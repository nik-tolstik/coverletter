"use client";

import { PlusIcon } from "lucide-react";

import type {
  ExperienceCompanyForm,
  ExperienceProjectForm,
} from "@/entities/profile";
import {
  AnimatedList,
  AnimatedListItem,
  useAnimatedListKeys,
} from "@/shared/ui/animated-list";
import { Button } from "@/shared/ui/button";

import { EmptySectionState } from "../empty-section-state";
import { CompanyEditor } from "../editors/company-editor";
import { ProfileSectionCard } from "../profile-section-card";

export function ExperienceSection({
  experience,
  onAdd,
  onChange,
  onRemove,
  onProjectChange,
  onProjectAdd,
  onProjectRemove,
}: {
  experience: ExperienceCompanyForm[];
  onAdd: () => void;
  onChange: (index: number, company: ExperienceCompanyForm) => void;
  onRemove: (index: number) => void;
  onProjectChange: (
    companyIndex: number,
    projectIndex: number,
    project: ExperienceProjectForm,
  ) => void;
  onProjectAdd: (companyIndex: number) => void;
  onProjectRemove: (companyIndex: number, projectIndex: number) => void;
}) {
  const { keys, insertKey, removeKey } = useAnimatedListKeys(
    experience.length,
    "company",
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
      title="Опыт"
      contentId="profile-experience-content"
      contentClassName="flex flex-col gap-8"
    >
      <AnimatedList className="-mb-8 flex flex-col">
        {experience.map((company, companyIndex) => (
          <AnimatedListItem
            key={keys[companyIndex]}
            itemKey={keys[companyIndex]}
            spacing="2rem"
          >
            <CompanyEditor
              company={company}
              index={companyIndex}
              onChange={(nextCompany) => onChange(companyIndex, nextCompany)}
              onRemove={() => handleRemove(companyIndex)}
              onProjectChange={(projectIndex, nextProject) =>
                onProjectChange(companyIndex, projectIndex, nextProject)
              }
              onProjectAdd={() => onProjectAdd(companyIndex)}
              onProjectRemove={(projectIndex) =>
                onProjectRemove(companyIndex, projectIndex)
              }
            />
          </AnimatedListItem>
        ))}
        {!experience.length && (
          <AnimatedListItem
            key="empty-experience"
            itemKey="empty-experience"
            spacing="2rem"
          >
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
        Добавить компанию
      </Button>
    </ProfileSectionCard>
  );
}
