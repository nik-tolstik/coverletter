export const DEFAULT_OPENROUTER_MODEL = "openai/gpt-5.4-mini";

export const OPENROUTER_MODEL_OPTIONS = [
  {
    value: "openai/gpt-5.4",
    label: "GPT-5.4",
    tier: "pro",
    priceLabel: "$2.50 / $15",
  },
  {
    value: "anthropic/claude-opus-4.8",
    label: "Claude Opus 4.8",
    tier: "pro",
    priceLabel: "$5 / $25",
  },
  {
    value: "deepseek/deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    tier: "pro",
    priceLabel: "$0.435 / $0.87",
  },
  {
    value: DEFAULT_OPENROUTER_MODEL,
    label: "GPT-5.4 Mini",
    tier: "balanced",
    priceLabel: "$0.75 / $4.50",
  },
  {
    value: "openai/gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    tier: "balanced",
    priceLabel: "$0.20 / $1.25",
  },
  {
    value: "anthropic/claude-sonnet-5",
    label: "Claude Sonnet 5",
    tier: "balanced",
    priceLabel: "$2 / $10",
  },
  {
    value: "deepseek/deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    tier: "balanced",
    priceLabel: "$0.089 / $0.18",
  },
  {
    value: "qwen/qwen3.7-plus",
    label: "Qwen3.7 Plus",
    tier: "balanced",
    priceLabel: "$0.32 / $1.28",
  },
  {
    value: "nvidia/nemotron-3-nano-30b-a3b:free",
    label: "Nemotron 3 Nano 30B Free",
    tier: "free",
    priceLabel: "$0 / $0",
  },
] as const;

export function normalizeOpenRouterModel(model: string) {
  const normalizedModel = writeLineValue(model);

  return OPENROUTER_MODEL_OPTIONS.some(
    (option) => option.value === normalizedModel,
  )
    ? normalizedModel
    : DEFAULT_OPENROUTER_MODEL;
}

function writeLineValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
