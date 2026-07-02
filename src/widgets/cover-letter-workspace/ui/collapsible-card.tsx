"use client";

import { type ReactNode, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

export function CollapsibleCard({
  title,
  contentId,
  action,
  defaultOpen = true,
  children,
}: {
  title: string;
  contentId: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="gap-0">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none transition-colors hover:text-foreground focus-visible:opacity-90"
          onClick={() => setIsOpen((current) => !current)}
        >
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
              !isOpen && "-rotate-90",
            )}
          />
          <span className="flex min-w-0 flex-col gap-1">
            <CardTitle>{title}</CardTitle>
          </span>
        </button>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CollapsibleContent
        id={contentId}
        isOpen={isOpen}
        contentClassName="pt-(--card-spacing)"
      >
        <CardContent>{children}</CardContent>
      </CollapsibleContent>
    </Card>
  );
}

function CollapsibleContent({
  id,
  isOpen,
  contentClassName,
  children,
}: {
  id: string;
  isOpen: boolean;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      aria-hidden={!isOpen}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden" inert={!isOpen}>
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}
