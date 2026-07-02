import ClaudeIcon from "@lobehub/icons/es/Claude/components/Color";
import DeepSeekIcon from "@lobehub/icons/es/DeepSeek/components/Color";
import MetaIcon from "@lobehub/icons/es/Meta/components/Color";
import NvidiaIcon from "@lobehub/icons/es/Nvidia/components/Color";
import OpenAIIcon from "@lobehub/icons/es/OpenAI/components/Mono";
import QwenIcon from "@lobehub/icons/es/Qwen/components/Color";
import { SparklesIcon } from "lucide-react";

import {
  DEFAULT_OPENROUTER_MODEL,
  OPENROUTER_MODEL_OPTIONS,
} from "@/entities/cover-letter-settings";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

import { OPENROUTER_MODEL_GROUPS } from "../model/constants";

type OpenRouterModelOption = (typeof OPENROUTER_MODEL_OPTIONS)[number];

const MODEL_LOGOS = [
  { prefix: "openai/", icon: OpenAIIcon, className: "text-[#10a37f]" },
  { prefix: "anthropic/", icon: ClaudeIcon },
  { prefix: "deepseek/", icon: DeepSeekIcon },
  { prefix: "meta-llama/", icon: MetaIcon },
  { prefix: "nvidia/", icon: NvidiaIcon },
  { prefix: "qwen/", icon: QwenIcon },
] as const;

export function ModelSelect({
  id,
  value,
  onValueChange,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const selectedModelOption =
    OPENROUTER_MODEL_OPTIONS.find((item) => item.value === value) ??
    OPENROUTER_MODEL_OPTIONS.find(
      (item) => item.value === DEFAULT_OPENROUTER_MODEL,
    );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>
          {selectedModelOption && (
            <ModelSelectLabel option={selectedModelOption} />
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[calc(100vw-2rem)] max-w-[728px]">
        {OPENROUTER_MODEL_GROUPS.map((group, groupIndex) => (
          <SelectGroup key={group.tier}>
            <SelectLabel>{group.label}</SelectLabel>
            {OPENROUTER_MODEL_OPTIONS.filter(
              (item) => item.tier === group.tier,
            ).map((item) => (
              <SelectItem
                value={item.value}
                key={item.value}
                textValue={`${item.label} ${item.priceLabel}`}
              >
                <ModelSelectLabel option={item} showPrice />
              </SelectItem>
            ))}
            {groupIndex < OPENROUTER_MODEL_GROUPS.length - 1 && (
              <SelectSeparator />
            )}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

function ModelSelectLabel({
  option,
  showPrice = false,
}: {
  option: OpenRouterModelOption;
  showPrice?: boolean;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <ModelLogo model={option.value} />
      <span className="min-w-0 truncate">
        {option.label}
        {showPrice && (
          <span className="text-muted-foreground"> - {option.priceLabel}</span>
        )}
      </span>
    </span>
  );
}

export function ModelLogo({ model }: { model: string }) {
  const logo = MODEL_LOGOS.find((item) => model.startsWith(item.prefix));
  const Icon = logo?.icon ?? SparklesIcon;
  const iconClassName =
    logo && "className" in logo ? logo.className : undefined;

  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-input/40 text-muted-foreground">
      <Icon
        aria-hidden="true"
        className={cn("size-3.5", iconClassName)}
        focusable="false"
      />
    </span>
  );
}
