"use client";

import type { ProfileFormState } from "@/entities/profile";
import type { IdentityKey } from "@/features/edit-profile/model/use-profile-editor";
import { FieldGroup } from "@/shared/ui/field";

import { LanguagesField } from "../fields/languages-field";
import { TextInputField } from "../fields/text-input-field";
import { WorkFormatField } from "../fields/work-format-field";
import { ProfileSectionCard } from "../profile-section-card";

const identityFields: Array<{
  key: Exclude<IdentityKey, "workFormat" | "languages">;
  label: string;
  placeholder: string;
}> = [
  {
    key: "name",
    label: "Имя",
    placeholder: "Иван Иванов",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "niko.tolstik@gmail.com",
  },
  {
    key: "currentPosition",
    label: "Текущая позиция",
    placeholder: "Frontend Engineer",
  },
  {
    key: "experience",
    label: "Опыт",
    placeholder: "5 лет коммерческой разработки",
  },
  {
    key: "location",
    label: "Локация",
    placeholder: "Минск, Беларусь",
  },
];

export function IdentitySection({
  identity,
  onUpdate,
}: {
  identity: ProfileFormState["identity"];
  onUpdate: (key: IdentityKey, value: string) => void;
}) {
  return (
    <ProfileSectionCard
      title="Личные данные"
      contentId="profile-identity-content"
    >
      <FieldGroup className="grid gap-5">
        {identityFields.map((field) => (
          <TextInputField
            key={field.key}
            id={`identity-${field.key}`}
            label={field.label}
            placeholder={field.placeholder}
            type={field.key === "email" ? "email" : "text"}
            value={identity[field.key]}
            onChange={(value) => onUpdate(field.key, value)}
          />
        ))}
        <WorkFormatField
          value={identity.workFormat}
          onChange={(value) => onUpdate("workFormat", value)}
        />
        <LanguagesField
          value={identity.languages}
          onChange={(value) => onUpdate("languages", value)}
        />
      </FieldGroup>
    </ProfileSectionCard>
  );
}
