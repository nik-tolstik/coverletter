"use client";

import { UserRoundIcon } from "lucide-react";

import type { ProfileFormState } from "@/entities/profile";
import type { IdentityKey } from "@/features/edit-profile/model/use-profile-editor";
import { FieldGroup } from "@/shared/ui/field";

import { AvatarUploader } from "../avatar-uploader";
import { LanguagesField } from "../fields/languages-field";
import { TextInputField } from "../fields/text-input-field";
import { WorkFormatField } from "../fields/work-format-field";
import { ProfileSectionCard } from "../profile-section-card";

const identityFields: Array<{
  key: Exclude<IdentityKey, "avatarUrl" | "workFormat" | "languages">;
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
  isAvatarUploading,
  onUpdate,
  onAvatarUpload,
}: {
  identity: ProfileFormState["identity"];
  isAvatarUploading: boolean;
  onUpdate: (key: IdentityKey, value: string) => void;
  onAvatarUpload: (file: File) => void;
}) {
  return (
    <ProfileSectionCard
      title="Личные данные"
      icon={UserRoundIcon}
      contentId="profile-identity-content"
    >
      <FieldGroup className="grid gap-5">
        <AvatarUploader
          avatarUrl={identity.avatarUrl}
          isUploading={isAvatarUploading}
          onUpload={onAvatarUpload}
        />
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
