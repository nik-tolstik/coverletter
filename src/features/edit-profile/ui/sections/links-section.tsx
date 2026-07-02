"use client";

import type { IconType } from "react-icons";
import { FaGithub, FaGlobe, FaLinkedin, FaTelegramPlane } from "react-icons/fa";

import type { ProfileFormState } from "@/entities/profile";
import type { LinkKey } from "@/features/edit-profile/model/use-profile-editor";
import { FieldGroup } from "@/shared/ui/field";

import { LinkInputField } from "../fields/link-input-field";
import { ProfileSectionCard } from "../profile-section-card";

const linkFields: Array<{
  key: LinkKey;
  label: string;
  icon: IconType;
  iconClassName: string;
  placeholder: string;
}> = [
  {
    key: "github",
    label: "GitHub",
    icon: FaGithub,
    iconClassName: "text-[#181717] dark:text-white",
    placeholder: "https://github.com/username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedin,
    iconClassName: "text-[#0a66c2]",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    key: "portfolio",
    label: "Портфолио",
    icon: FaGlobe,
    iconClassName: "text-[#14b8a6]",
    placeholder: "https://username.dev",
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: FaTelegramPlane,
    iconClassName: "text-[#26a5e4]",
    placeholder: "@username",
  },
];

export function LinksSection({
  links,
  onUpdate,
}: {
  links: ProfileFormState["links"];
  onUpdate: (key: LinkKey, value: string) => void;
}) {
  return (
    <ProfileSectionCard title="Ссылки" contentId="profile-links-content">
      <FieldGroup className="grid gap-5">
        {linkFields.map((field) => (
          <LinkInputField
            key={field.key}
            id={`link-${field.key}`}
            label={field.label}
            icon={field.icon}
            iconClassName={field.iconClassName}
            placeholder={field.placeholder}
            value={links[field.key]}
            onChange={(value) => onUpdate(field.key, value)}
          />
        ))}
      </FieldGroup>
    </ProfileSectionCard>
  );
}
