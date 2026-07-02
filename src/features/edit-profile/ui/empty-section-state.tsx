import { InboxIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export function EmptySectionState({
  label = "Пусто",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-input/20 px-4 py-8 text-center",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border/60">
        <InboxIcon className="size-5" aria-hidden="true" />
      </span>
      <p className="font-heading text-sm font-medium text-foreground">
        {label}
      </p>
    </div>
  );
}
