"use client";

import { PlusIcon } from "lucide-react";

import type {
  ExperienceCompanyForm,
  ExperienceProjectForm,
} from "@/entities/profile";
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
  return (
    <ProfileSectionCard
      title="Опыт"
      contentId="profile-experience-content"
      contentClassName="flex flex-col gap-8"
    >
      {experience.length ? (
        experience.map((company, companyIndex) => (
          <CompanyEditor
            key={companyIndex}
            company={company}
            index={companyIndex}
            onChange={(nextCompany) => onChange(companyIndex, nextCompany)}
            onRemove={() => onRemove(companyIndex)}
            onProjectChange={(projectIndex, nextProject) =>
              onProjectChange(companyIndex, projectIndex, nextProject)
            }
            onProjectAdd={() => onProjectAdd(companyIndex)}
            onProjectRemove={(projectIndex) =>
              onProjectRemove(companyIndex, projectIndex)
            }
          />
        ))
      ) : (
        <EmptySectionState />
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onAdd}
      >
        <PlusIcon data-icon="inline-start" />
        Добавить компанию
      </Button>
    </ProfileSectionCard>
  );
}
