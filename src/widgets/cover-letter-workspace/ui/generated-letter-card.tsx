import { CopyIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import { GeneratingLetterState } from "./generating-letter-state";

export function GeneratedLetterCard({
  coverLetter,
  loading,
  onCopy,
}: {
  coverLetter: string;
  loading: boolean;
  onCopy: () => void;
}) {
  return (
    <Card className="min-h-0 origin-top will-change-transform motion-safe:animate-[letter-card-in_360ms_cubic-bezier(0.16,1,0.3,1)_both]">
      <CardHeader>
        <CardTitle>Письмо</CardTitle>
        {coverLetter && !loading ? (
          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Копировать письмо"
                  onClick={onCopy}
                >
                  <CopyIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Копировать</TooltipContent>
            </Tooltip>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="min-h-0">
        <div
          className={cn(
            "rounded-xl text-sm leading-7 whitespace-pre-wrap",
            loading ? "min-h-[26dvh]" : "min-h-[40dvh] bg-input/20 p-4",
          )}
        >
          {loading ? <GeneratingLetterState /> : coverLetter}
        </div>
      </CardContent>
    </Card>
  );
}
