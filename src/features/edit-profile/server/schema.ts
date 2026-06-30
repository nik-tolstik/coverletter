type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const profileWriteRequestSchema = {
  safeParse(input: unknown): ParseResult<{ profile: unknown }> {
    if (
      typeof input !== "object" ||
      input === null ||
      !("profile" in input) ||
      typeof input.profile !== "object" ||
      input.profile === null
    ) {
      return { success: false, error: "Профиль не может быть пустым." };
    }

    return {
      success: true,
      data: {
        profile: input.profile,
      },
    };
  },
};
