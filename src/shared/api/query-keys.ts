export const queryKeys = {
  user: (email: string) => ["user", email] as const,
  profile: (email: string) => [...queryKeys.user(email), "profile"] as const,
  coverLetterSettings: (email: string) =>
    [...queryKeys.user(email), "cover-letter-settings"] as const,
  coverLetterHistory: (email: string) =>
    [...queryKeys.user(email), "cover-letter-history"] as const,
};
