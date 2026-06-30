import type { ProfileFormState } from "./structured-profile";

export type ProfileState = {
  profile: ProfileFormState;
  markdown: string;
  source: "redis" | "template";
  updatedAt?: string;
};
