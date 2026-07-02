"use client";

import { SaveIcon, XIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";

export type SaveChangesBarProps = {
  isPending: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveError?: string;
};

export function SaveChangesBar({
  isPending,
  onCancel,
  onSave,
  saveError,
}: SaveChangesBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(4.8rem+env(safe-area-inset-bottom))] z-40 border-t border-border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3 px-4 py-4">
        <div role="status" aria-live="polite" aria-busy={isPending}>
          <p className="text-sm font-medium">
            {saveError || "Есть несохранённые изменения"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            <XIcon data-icon="inline-start" />
            Отменить
          </Button>
          <Button type="button" onClick={onSave} disabled={isPending}>
            <SaveIcon data-icon="inline-start" />
            {isPending ? "Сохраняю..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
