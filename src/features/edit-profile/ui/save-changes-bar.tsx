"use client";

import { Button } from "@/shared/ui/button";

export type SaveChangesBarProps = {
  isPending: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export function SaveChangesBar({
  isPending,
  onCancel,
  onSave,
}: SaveChangesBarProps) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 shadow-lg backdrop-blur will-change-transform motion-safe:animate-[save-changes-bar-in_260ms_cubic-bezier(0.16,1,0.3,1)_both] supports-[backdrop-filter]:bg-background/80"
      aria-busy={isPending}
    >
      <div className="mx-auto flex w-full max-w-190 items-center justify-between gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Отмена
        </Button>
        <Button type="button" onClick={onSave} disabled={isPending}>
          Готово
        </Button>
      </div>
    </div>
  );
}
