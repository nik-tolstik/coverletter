import { RotateCcwIcon } from "lucide-react";

import { DEFAULT_COVER_LETTER_RULES } from "@/entities/cover-letter-settings";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

import { CollapsibleCard } from "./collapsible-card";

export function CoverLetterRulesCard({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <CollapsibleCard
      title="Правила письма"
      contentId="cover-letter-rules-content"
      defaultOpen={false}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onValueChange(DEFAULT_COVER_LETTER_RULES.join("\n"))}
        >
          <RotateCcwIcon data-icon="inline-start" />
          Сбросить
        </Button>
      }
    >
      <Textarea
        id="cover-letter-rules"
        aria-label="Правила письма"
        placeholder="Одно правило на строку."
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </CollapsibleCard>
  );
}
