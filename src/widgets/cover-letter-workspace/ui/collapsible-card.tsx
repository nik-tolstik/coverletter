"use client";

import { type ReactNode, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

export function CollapsibleCard({
  title,
  contentId,
  action,
  className,
  contentClassName,
  contentWrapperClassName,
  defaultOpen = true,
  headerClassName,
  titleClassName,
  children,
}: {
  title: string;
  contentId: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  contentWrapperClassName?: string;
  defaultOpen?: boolean;
  headerClassName?: string;
  titleClassName?: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between gap-3",
          headerClassName,
        )}
      >
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
            <CardTitle className={titleClassName}>{title}</CardTitle>
          </span>
        </button>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CollapsibleContent
        id={contentId}
        isOpen={isOpen}
        contentWrapperClassName={cn(
          "pt-(--card-spacing)",
          contentWrapperClassName,
        )}
      >
        <CardContent className={contentClassName}>{children}</CardContent>
      </CollapsibleContent>
    </Card>
  );
}

function CollapsibleContent({
  id,
  isOpen,
  contentWrapperClassName,
  children,
}: {
  id: string;
  isOpen: boolean;
  contentWrapperClassName?: string;
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
        <div className={contentWrapperClassName}>{children}</div>
      </div>
    </div>
  );
}
