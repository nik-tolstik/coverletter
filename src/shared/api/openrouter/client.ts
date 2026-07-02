import "server-only";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type ChatCompletionOptions = {
  model?: string;
};

type ChatCompletionResponse = {
  model?: string;
  provider?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    metadata?: OpenRouterErrorMetadata;
  };
};

type ChatCompletionResult = {
  content: string;
  model: string;
  provider?: string;
};

type OpenRouterErrorMetadata = Record<string, unknown> & {
  error_type?: string;
  provider_name?: string;
  raw?: string;
  retry_after_seconds?: number;
  retry_after_seconds_raw?: number;
};

const DEFAULT_OPENROUTER_MODEL = "openai/gpt-5.4-mini";

export async function createChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {},
) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY не настроен.");
  }

  const requestedModel =
    options.model ?? process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

  return requestChatCompletion({
    apiKey,
    messages,
    model: requestedModel,
  });
}

async function requestChatCompletion({
  apiKey,
  messages,
  model,
}: {
  apiKey: string;
  messages: ChatMessage[];
  model: string;
}): Promise<ChatCompletionResult> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000,
      provider: {
        allow_fallbacks: false,
      },
    }),
  });

  const data = await readChatCompletionResponse(response);

  if (!response.ok || data.error) {
    throw createOpenRouterRequestError(response, data);
  }

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error(
      "Выбранная модель OpenRouter сейчас недоступна или вернула пустой ответ. Попробуйте позже или выберите другую модель.",
    );
  }

  return {
    content,
    model,
    provider: data.provider,
  };
}

function buildHeaders(apiKey: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-OpenRouter-Title": process.env.OPENROUTER_APP_TITLE ?? "Coverletter",
  };

  if (process.env.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }

  return headers;
}

async function readChatCompletionResponse(
  response: Response,
): Promise<ChatCompletionResponse> {
  try {
    return (await response.json()) as ChatCompletionResponse;
  } catch {
    throw new Error(
      "OpenRouter вернул нечитаемый ответ. Попробуйте повторить запрос.",
    );
  }
}

function createOpenRouterRequestError(
  response: Response,
  data: ChatCompletionResponse,
) {
  const status = data.error?.code ?? response.status;
  const retryAfterSeconds = getRetryAfterSeconds(response, data.error?.metadata);

  return new Error(
    getOpenRouterErrorMessage({
      retryAfterSeconds,
      status,
    }),
  );
}

function getOpenRouterErrorMessage({
  retryAfterSeconds,
  status,
}: {
  retryAfterSeconds?: number;
  status: number;
}) {
  const retryText = retryAfterSeconds
    ? ` Попробуйте ещё раз через ${formatRetryAfter(retryAfterSeconds)}.`
    : " Попробуйте ещё раз позже.";

  if (status === 401) {
    return "Ключ OpenRouter недействителен или отключён.";
  }

  if (status === 402) {
    return "На аккаунте OpenRouter не хватает кредитов. При отрицательном балансе OpenRouter может блокировать даже бесплатные модели.";
  }

  if (status === 403) {
    return "OpenRouter отклонил запрос. Проверьте доступ ключа к выбранной модели.";
  }

  if (status === 429) {
    return `Выбранная модель OpenRouter сейчас недоступна или временно ограничена провайдером.${retryText}`;
  }

  if (status === 502 || status === 503) {
    return `Выбранная модель OpenRouter сейчас недоступна или перегружена.${retryText}`;
  }

  if (status === 408) {
    return `OpenRouter не успел ответить по выбранной модели.${retryText}`;
  }

  return "Запрос к OpenRouter не выполнен. Попробуйте другую модель или повторите позже.";
}

function getRetryAfterSeconds(
  response: Response,
  metadata?: OpenRouterErrorMetadata,
) {
  const metadataRetryAfter =
    typeof metadata?.retry_after_seconds === "number"
      ? metadata.retry_after_seconds
      : typeof metadata?.retry_after_seconds_raw === "number"
        ? metadata.retry_after_seconds_raw
        : undefined;
  const headerRetryAfter = Number(response.headers.get("Retry-After"));
  const retryAfterSeconds =
    metadataRetryAfter ??
    (Number.isFinite(headerRetryAfter) ? headerRetryAfter : undefined);

  return retryAfterSeconds && retryAfterSeconds > 0
    ? Math.ceil(retryAfterSeconds)
    : undefined;
}

function formatRetryAfter(seconds: number) {
  return `${seconds} сек.`;
}
