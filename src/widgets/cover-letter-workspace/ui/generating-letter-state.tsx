import { SparklesIcon } from "lucide-react";

export function GeneratingLetterState() {
  return (
    <div className="flex min-h-[inherit] flex-col justify-between gap-6 overflow-hidden">
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SparklesIcon className="size-5 animate-pulse" />
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-medium">Генерирую письмо</span>
          <span className="text-xs text-muted-foreground">
            Подбираю факты из профиля под вакансию.
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="h-4 w-11/12 animate-pulse rounded-full bg-foreground/10" />
        <span className="h-4 w-10/12 animate-pulse rounded-full bg-foreground/10 [animation-delay:120ms]" />
        <span className="h-4 w-8/12 animate-pulse rounded-full bg-foreground/10 [animation-delay:240ms]" />
        <span className="mt-3 h-4 w-full animate-pulse rounded-full bg-foreground/10 [animation-delay:360ms]" />
        <span className="h-4 w-9/12 animate-pulse rounded-full bg-foreground/10 [animation-delay:480ms]" />
        <span className="h-4 w-7/12 animate-pulse rounded-full bg-foreground/10 [animation-delay:600ms]" />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div className="h-full w-1/3 animate-[generation-progress_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
    </div>
  );
}
