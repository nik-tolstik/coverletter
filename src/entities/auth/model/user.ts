export const OWNER_EMAIL = "niko.tolstik@gmail.com";

export const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS = 60 * 60 * 24;
export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 60;

export type AuthUserJson = {
  schemaVersion: 1;
  id: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokenJson = {
  schemaVersion: 1;
  email: string;
  createdAt: string;
};

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isOwnerEmail(email: string) {
  return normalizeAuthEmail(email) === OWNER_EMAIL;
}

export function encodeAuthEmail(email: string) {
  return encodeURIComponent(normalizeAuthEmail(email));
}

export function getAuthUserRedisKey(email: string) {
  return `auth:user:${encodeAuthEmail(email)}:json`;
}

export function getEmailVerificationTokenRedisKey(tokenDigest: string) {
  return `auth:email-verification:${tokenDigest}:json`;
}

export function getPasswordResetTokenRedisKey(tokenDigest: string) {
  return `auth:password-reset:${tokenDigest}:json`;
}

export function getUserScopedRedisKey(
  namespace: string,
  email: string,
  suffix = "json",
) {
  return `${namespace}:user:${encodeAuthEmail(email)}:${suffix}`;
}

export function normalizeAuthUserJson(input: unknown): AuthUserJson | null {
  if (!isRecord(input)) {
    return null;
  }

  const email = normalizeAuthEmail(readString(input.email));
  const passwordHash = readString(input.passwordHash);
  const createdAt = readString(input.createdAt);

  if (!email || !passwordHash || !createdAt) {
    return null;
  }

  return {
    schemaVersion: 1,
    id: readString(input.id) || email,
    email,
    passwordHash,
    emailVerifiedAt: readNullableString(input.emailVerifiedAt),
    createdAt,
    updatedAt: readString(input.updatedAt) || createdAt,
  };
}

export function normalizeAuthTokenJson(input: unknown): AuthTokenJson | null {
  if (!isRecord(input)) {
    return null;
  }

  const email = normalizeAuthEmail(readString(input.email));
  const createdAt = readString(input.createdAt);

  if (!email || !createdAt) {
    return null;
  }

  return {
    schemaVersion: 1,
    email,
    createdAt,
  };
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function readString(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

function readNullableString(input: unknown) {
  return typeof input === "string" && input.trim() ? input.trim() : null;
}
