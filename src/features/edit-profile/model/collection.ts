import type { ProfileFormState } from "@/entities/profile";

export function serializeProfile(profile: ProfileFormState): string {
  return JSON.stringify(profile);
}

export function removeAt<T>(items: T[], index: number, fallback: T): T[] {
  const nextItems = items.filter((_, currentIndex) => currentIndex !== index);

  return nextItems.length ? nextItems : [fallback];
}

export function removeAtOrEmpty<T>(items: T[], index: number): T[] {
  return items.filter((_, currentIndex) => currentIndex !== index);
}
