export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const fallbackErrorMessage = "Что-то пошло не так.";

export async function requestJson<T>(
  input: RequestInfo | URL,
  init: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<T> {
  const { body, headers, ...requestInit } = init;
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...requestInit,
    body:
      body === undefined
        ? undefined
        : typeof body === "string"
          ? body
          : JSON.stringify(body),
    headers: requestHeaders,
  });

  return readJsonResponse<T>(response);
}

export async function requestForm<T>(
  input: RequestInfo | URL,
  body: FormData,
  init?: Omit<RequestInit, "body">,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    body,
    headers: init?.headers,
  });

  return readJsonResponse<T>(response);
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = await readJsonBody(response);

  if (!response.ok) {
    throw new ApiError(readErrorMessage(data), response.status);
  }

  return data as T;
}

async function readJsonBody(response: Response) {
  const contentType = response.headers.get("content-type");

  if (!isJsonContentType(contentType)) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isJsonContentType(contentType: string | null) {
  if (!contentType) {
    return false;
  }

  const mediaType = contentType.split(";")[0]?.trim().toLowerCase();

  return mediaType === "application/json" || mediaType.endsWith("+json");
}

function readErrorMessage(data: unknown) {
  if (isRecord(data) && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return fallbackErrorMessage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
