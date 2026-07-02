"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export function CollapsibleContent({
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
