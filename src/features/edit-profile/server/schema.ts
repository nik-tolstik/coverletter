import type { ProfileFormState } from "@/entities/profile";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const invalidProfileError = "Профиль содержит некорректные данные.";

const identityFields = [
  "avatarUrl",
  "name",
  "email",
  "currentPosition",
  "experience",
  "location",
  "workFormat",
  "languages",
] as const satisfies readonly (keyof ProfileFormState["identity"])[];

const linkFields = [
  "github",
  "linkedin",
  "portfolio",
  "telegram",
] as const satisfies readonly (keyof ProfileFormState["links"])[];

const companyFields = [
  "companyName",
  "role",
  "employmentType",
  "dates",
  "domain",
  "description",
] as const satisfies readonly Exclude<
  keyof ProfileFormState["experience"][number],
  "projects"
>[];

const projectFields = [
  "name",
  "role",
  "stack",
  "workDescription",
] as const satisfies readonly (keyof ProfileFormState["projects"][number])[];

export const profileWriteRequestSchema = {
  safeParse(input: unknown): ParseResult<{ profile: ProfileFormState }> {
    if (
      !isRecord(input) ||
      !("profile" in input) ||
      input.profile === null
    ) {
      return { success: false, error: "Профиль не может быть пустым." };
    }

    if (!isProfileFormState(input.profile)) {
      return { success: false, error: invalidProfileError };
    }

    return {
      success: true,
      data: {
        profile: input.profile,
      },
    };
  },
};

function isProfileFormState(input: unknown): input is ProfileFormState {
  if (!isRecord(input)) {
    return false;
  }

  return (
    hasStringFields(input.identity, identityFields) &&
    hasStringFields(input.links, linkFields) &&
    Array.isArray(input.skills) &&
    input.skills.every(isSkillCategory) &&
    Array.isArray(input.experience) &&
    input.experience.every(isExperienceCompany) &&
    Array.isArray(input.projects) &&
    input.projects.every(isProject)
  );
}

function isSkillCategory(
  input: unknown,
): input is ProfileFormState["skills"][number] {
  return (
    isRecord(input) &&
    typeof input.name === "string" &&
    Array.isArray(input.skills) &&
    input.skills.every(isString)
  );
}

function isExperienceCompany(
  input: unknown,
): input is ProfileFormState["experience"][number] {
  return (
    isRecord(input) &&
    hasStringFields(input, companyFields) &&
    Array.isArray(input.projects) &&
    input.projects.every(isProject)
  );
}

function isProject(input: unknown): input is ProfileFormState["projects"][number] {
  return isRecord(input) && hasStringFields(input, projectFields);
}

function hasStringFields<T extends string>(
  input: unknown,
  fields: readonly T[],
): input is Record<T, string> & Record<string, unknown> {
  return (
    isRecord(input) &&
    fields.every((field) => typeof input[field] === "string")
  );
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}

function isString(input: unknown): input is string {
  return typeof input === "string";
}
