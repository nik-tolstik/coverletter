import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const hashPrefix = "scrypt";
const keyLength = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer;

  return `${hashPrefix}:${salt}:${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [prefix, salt, storedKey] = passwordHash.split(":");

  if (prefix !== hashPrefix || !salt || !storedKey) {
    return false;
  }

  const storedBuffer = Buffer.from(storedKey, "base64url");
  const derivedKey = (await scryptAsync(password, salt, storedBuffer.length)) as Buffer;

  return (
    storedBuffer.length === derivedKey.length &&
    timingSafeEqual(storedBuffer, derivedKey)
  );
}
