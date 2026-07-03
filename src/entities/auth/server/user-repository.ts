import "server-only";

import { createHash, randomBytes } from "node:crypto";

import {
  EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
  OWNER_EMAIL,
  PASSWORD_RESET_TOKEN_TTL_SECONDS,
  getAuthUserRedisKey,
  getEmailVerificationTokenRedisKey,
  getPasswordResetTokenRedisKey,
  isOwnerEmail,
  normalizeAuthEmail,
  normalizeAuthTokenJson,
  normalizeAuthUserJson,
  type AuthTokenJson,
  type AuthUserJson,
} from "@/entities/auth/model";
import { getRedis } from "@/shared/api/upstash";

import { hashPassword, verifyPassword } from "./password";

const ownerInitialPassword = "Qwerty5072$";

export async function getAuthUserByEmail(email: string) {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  const normalizedEmail = normalizeAuthEmail(email);

  if (isOwnerEmail(normalizedEmail)) {
    return ensureOwnerUser();
  }

  const storedUser = await redis.get<unknown>(getAuthUserRedisKey(normalizedEmail));

  return normalizeAuthUserJson(storedUser);
}

export async function verifyAuthUserCredentials(
  email: string,
  password: string,
) {
  const user = await getAuthUserByEmail(email);

  if (!user?.emailVerifiedAt) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  return isValidPassword ? user : null;
}

export async function registerAuthUser(email: string, password: string) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  const normalizedEmail = normalizeAuthEmail(email);
  const existingUser = await getAuthUserByEmail(normalizedEmail);

  if (existingUser?.emailVerifiedAt) {
    throw new Error("Пользователь с такой почтой уже существует.");
  }

  const now = new Date().toISOString();
  const user: AuthUserJson = {
    schemaVersion: 1,
    id: existingUser?.id ?? normalizedEmail,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    emailVerifiedAt: null,
    createdAt: existingUser?.createdAt ?? now,
    updatedAt: now,
  };

  await saveAuthUser(user);

  return user;
}

export async function createEmailVerificationToken(email: string) {
  return createStoredToken(
    getEmailVerificationTokenRedisKey,
    email,
    EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
  );
}

export async function verifyEmailByToken(token: string) {
  const tokenPayload = await consumeToken(token, getEmailVerificationTokenRedisKey);

  if (!tokenPayload) {
    return null;
  }

  const user = await getAuthUserByEmail(tokenPayload.email);

  if (!user) {
    return null;
  }

  const verifiedUser: AuthUserJson = {
    ...user,
    emailVerifiedAt: user.emailVerifiedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveAuthUser(verifiedUser);

  return verifiedUser;
}

export async function createPasswordResetToken(email: string) {
  const user = await getAuthUserByEmail(email);

  if (!user?.emailVerifiedAt) {
    return null;
  }

  return createStoredToken(
    getPasswordResetTokenRedisKey,
    user.email,
    PASSWORD_RESET_TOKEN_TTL_SECONDS,
  );
}

export async function resetPasswordByToken(token: string, password: string) {
  const tokenPayload = await consumeToken(token, getPasswordResetTokenRedisKey);

  if (!tokenPayload) {
    return null;
  }

  const user = await getAuthUserByEmail(tokenPayload.email);

  if (!user) {
    return null;
  }

  const updatedUser: AuthUserJson = {
    ...user,
    passwordHash: await hashPassword(password),
    emailVerifiedAt: user.emailVerifiedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveAuthUser(updatedUser);

  return updatedUser;
}

async function ensureOwnerUser() {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  const key = getAuthUserRedisKey(OWNER_EMAIL);
  const storedUser = normalizeAuthUserJson(await redis.get<unknown>(key));
  const now = new Date().toISOString();

  if (storedUser) {
    if (storedUser.emailVerifiedAt) {
      return storedUser;
    }

    const verifiedUser: AuthUserJson = {
      ...storedUser,
      emailVerifiedAt: now,
      updatedAt: now,
    };

    await saveAuthUser(verifiedUser);

    return verifiedUser;
  }

  const user: AuthUserJson = {
    schemaVersion: 1,
    id: OWNER_EMAIL,
    email: OWNER_EMAIL,
    passwordHash: await hashPassword(
      process.env.AUTH_OWNER_INITIAL_PASSWORD ?? ownerInitialPassword,
    ),
    emailVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await saveAuthUser(user);

  return user;
}

async function saveAuthUser(user: AuthUserJson) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  const key = getAuthUserRedisKey(user.email);

  await redis.set(key, user);

  const storedUser = normalizeAuthUserJson(await redis.get<unknown>(key));

  if (JSON.stringify(storedUser) !== JSON.stringify(user)) {
    throw new Error("Не удалось подтвердить сохранение пользователя.");
  }
}

async function createStoredToken(
  getKey: (tokenDigest: string) => string,
  email: string,
  ttlSeconds: number,
) {
  const redis = getRedis();

  if (!redis) {
    throw new Error("Переменные окружения хранилища не настроены.");
  }

  const token = randomBytes(32).toString("base64url");
  const tokenPayload: AuthTokenJson = {
    schemaVersion: 1,
    email: normalizeAuthEmail(email),
    createdAt: new Date().toISOString(),
  };

  await redis.set(getKey(digestToken(token)), tokenPayload, { ex: ttlSeconds });

  return token;
}

async function consumeToken(
  token: string,
  getKey: (tokenDigest: string) => string,
) {
  const redis = getRedis();
  const normalizedToken = token.trim();

  if (!redis || !normalizedToken) {
    return null;
  }

  const key = getKey(digestToken(normalizedToken));
  const tokenPayload = normalizeAuthTokenJson(await redis.get<unknown>(key));

  if (!tokenPayload) {
    return null;
  }

  await redis.del(key);

  return tokenPayload;
}

function digestToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}
