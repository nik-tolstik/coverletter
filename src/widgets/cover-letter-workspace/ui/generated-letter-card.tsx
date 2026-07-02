import { CopyIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import { GeneratingLetterState } from "./generating-letter-state";

export function GeneratedLetterCard({
  coverLetter,
  isGenerating,
  onCopy,
}: {
  coverLetter: string;
  isGenerating: boolean;
  onCopy: () => void;
}) {
  return (
    <Card className="min-h-0">
      <CardHeader>
        <CardTitle>Письмо</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0">
        <div
          className={cn(
            "relative rounded-xl bg-input/20 p-4 text-sm leading-7 whitespace-pre-wrap",
            isGenerating ? "min-h-[26dvh]" : "min-h-[40dvh]",
            coverLetter && !isGenerating && "pr-14",
          )}
        >
          {coverLetter && !isGenerating && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="absolute top-3 right-3"
                  aria-label="Копировать письмо"
                  onClick={onCopy}
                >
                  <CopyIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Копировать</TooltipContent>
            </Tooltip>
          )}
          {isGenerating ? <GeneratingLetterState /> : coverLetter}
        </div>
      </CardContent>
    </Card>
  );
}
