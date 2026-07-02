"use client";

import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/shared/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { CollapsibleContent } from "./collapsible-content";

export function ProfileSectionCard({
  title,
  contentId,
  action,
  contentClassName,
  defaultOpen = true,
  children,
}: {
  title: string;
  contentId: string;
  action?: ReactNode;
  contentClassName?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="gap-0">
      <CardHeader>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="group flex min-w-0 items-center gap-2 rounded-lg text-left outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
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
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CollapsibleContent
        id={contentId}
        isOpen={isOpen}
        contentClassName="pt-(--card-spacing)"
      >
        <CardContent className={contentClassName}>{children}</CardContent>
      </CollapsibleContent>
    </Card>
  );
}
