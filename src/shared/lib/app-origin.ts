const VERCEL_URL_REFERENCES = new Map([
  ["$VERCEL_URL", getVercelOriginValue],
  ["${VERCEL_URL}", getVercelOriginValue],
  ["$VERCEL_PROJECT_PRODUCTION_URL", () => process.env.VERCEL_PROJECT_PRODUCTION_URL],
  ["${VERCEL_PROJECT_PRODUCTION_URL}", () => process.env.VERCEL_PROJECT_PRODUCTION_URL],
]);

export function getConfiguredAppOrigin(
  value = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL,
) {
  const resolvedValue = resolveAppOriginValue(value);

  if (!resolvedValue) {
    return undefined;
  }

  return normalizeAppOrigin(resolvedValue);
}

export function getVercelAppOrigin() {
  return normalizeAppOrigin(getVercelOriginValue());
}

function resolveAppOriginValue(value?: string) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const envReference = VERCEL_URL_REFERENCES.get(trimmedValue);

  if (envReference) {
    return envReference();
  }

  return trimmedValue;
}

function getVercelOriginValue() {
  if (isVercelProductionEnvironment()) {
    return process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  }

  return process.env.VERCEL_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
}

function isVercelProductionEnvironment() {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_TARGET_ENV === "production"
  );
}

function normalizeAppOrigin(value?: string) {
  if (!value) {
    return undefined;
  }

  const valueWithProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(value)
    ? value
    : `https://${value}`;

  try {
    return new URL(valueWithProtocol).origin;
  } catch {
    return undefined;
  }
}
